#!/usr/bin/env python3
"""Qurridor server: serves the game and handles login + saved progress.
Database: SQLite file qurridor.db.
"""
import argparse, hashlib, hmac, json, os, re, secrets, sqlite3, threading, time
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='', static_url_path='')

ROOT = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT, "qurridor.db")
ITERATIONS = 200_000
NAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")
SESSION_HOURS = 24

# Session store: token -> (username, expires_datetime)
SESSIONS = {}
SESSION_LOCK = threading.Lock()

# Online 1v1 rooms (kept in memory)
ROOMS = {}
ROOMS_LOCK = threading.Lock()
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ROOM_TTL = 3 * 3600
MAX_ROOMS = 500
ID_RE = re.compile(r"^\d{1,4}$")
FORFEIT_AFTER = 45  # seconds without a signal

def prune_rooms():
    now = time.time()
    for code in [c for c, r in ROOMS.items() if now - r["touched"] > ROOM_TTL]:
        del ROOMS[code]

def side_of(room, user):
    u = user.lower()
    if room["host"].lower() == u:
        return 0
    if room["guest"] and room["guest"].lower() == u:
        return 1
    return None

def add_event(room, side, t, **kw):
    room["seq"] += 1
    ev = {"seq": room["seq"], "side": side, "t": t}
    ev.update(kw)
    room["events"].append(ev)
    return ev

def db():
    c = sqlite3.connect(DB_PATH, timeout=10)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON")
    return c

def init_db():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE COLLATE NOCASE,
            pw_hash BLOB NOT NULL,
            salt BLOB NOT NULL,
            failed INTEGER NOT NULL DEFAULT 0,
            locked_until TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS player_data (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            vso INTEGER NOT NULL DEFAULT 1000,
            unlocks TEXT NOT NULL DEFAULT '[false,false,false,false,false]',
            hank INTEGER NOT NULL DEFAULT 0,
            skin INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            result TEXT NOT NULL CHECK(result IN ('win','loss')),
            moves INTEGER NOT NULL,
            played_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS ix_games_user ON games(user_id, id DESC);
        """)

def hash_pw(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)

def recent_games(c, uid):
    rows = c.execute("SELECT result, moves, played_at FROM games WHERE user_id=? ORDER BY id DESC LIMIT 10", (uid,)).fetchall()
    return [{"result": r["result"], "moves": r["moves"], "at": r["played_at"]} for r in rows]

def load_data(c, uid):
    games = recent_games(c, uid)
    r = c.execute("SELECT vso, unlocks, hank, skin FROM player_data WHERE user_id=?", (uid,)).fetchone()
    if not r:
        return {"vso": 1000, "unlocks": [False] * 5, "hank": False, "skin": 0, "games": games}
    return {"vso": r["vso"], "unlocks": json.loads(r["unlocks"]), "hank": bool(r["hank"]), "skin": r["skin"], "games": games}

def clamp(v, lo, hi):
    try:
        v = int(v)
    except (TypeError, ValueError):
        v = 0
    return max(lo, min(hi, v))

def get_current_user():
    token = request.cookies.get("qsid")
    if not token:
        return None
    with SESSION_LOCK:
        s = SESSIONS.get(token)
        if not s:
            return None
        if s[1] < datetime.now(timezone.utc):
            del SESSIONS[token]
            return None
        return s[0]

def make_session_cookie(response, username):
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)
    with SESSION_LOCK:
        SESSIONS[token] = (username, expires)
    response.set_cookie("qsid", token, max_age=SESSION_HOURS * 3600, httponly=True, samesite='Lax')
    return response

# ---------- Flask Static & Root Routes ----------
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# ---------- Flask API Unified Endpoint ----------
@app.route('/api', methods=['POST'])
def api_router():
    action = request.args.get('a', '')
    req = request.get_json(silent=True) or {}
    
    try:
        if action == "register":
            return a_register(req)
        elif action == "login":
            return a_login(req)
        elif action == "logout":
            return a_logout()
        elif action == "me":
            return a_me()
        elif action == "save":
            return a_save(req)
        elif action == "game":
            return a_game(req)
        elif action == "room_create":
            return a_room_create(req)
        elif action == "room_join":
            return a_room_join(req)
        elif action == "room_poll":
            return a_room_poll(req)
        elif action == "room_mine":
            return a_room_mine()
        elif action == "room_send":
            return a_room_send(req)
        elif action == "room_leave":
            return a_room_leave(req)
        else:
            return jsonify({"ok": False, "error": "Unknown action"}), 400
    except sqlite3.Error:
        return jsonify({"ok": False, "error": "Server error"}), 500

# ---------- API Action Handlers ----------
def a_register(req):
    user = str(req.get("username", "")).strip()
    pw = str(req.get("password", ""))
    if not NAME_RE.match(user):
        return jsonify({"ok": False, "error": "Username must be 3-20 letters, numbers or _"}), 400
    if not 8 <= len(pw) <= 100:
        return jsonify({"ok": False, "error": "Password must be 8-100 characters"}), 400
    
    salt = secrets.token_bytes(16)
    h = hash_pw(pw, salt)
    try:
        with db() as c:
            cur = c.execute("INSERT INTO users(username, pw_hash, salt) VALUES(?,?,?)", (user, h, salt))
            uid = cur.lastrowid
            c.execute("INSERT INTO player_data(user_id) VALUES(?)", (uid,))
            data = load_data(c, uid)
    except sqlite3.IntegrityError:
        return jsonify({"ok": False, "error": "That username is taken"}), 409
    
    resp = jsonify({"ok": True, "username": user, "data": data})
    return make_session_cookie(resp, user)

def a_login(req):
    user = str(req.get("username", "")).strip()
    pw = str(req.get("password", ""))
    bad = "Wrong username or password"
    with db() as c:
        row = c.execute("SELECT * FROM users WHERE username=?", (user,)).fetchone() if NAME_RE.match(user) else None
        if not row:
            hash_pw(pw, b"\0" * 16)
            return jsonify({"ok": False, "error": bad}), 401
        if row["locked_until"]:
            if datetime.fromisoformat(row["locked_until"]) > datetime.now(timezone.utc):
                return jsonify({"ok": False, "error": "Too many attempts. Try again in a few minutes."}), 429
        
        ok = hmac.compare_digest(hash_pw(pw, row["salt"]), row["pw_hash"])
        if ok:
            c.execute("UPDATE users SET failed=0, locked_until=NULL WHERE id=?", (row["id"],))
            data = load_data(c, row["id"])
        else:
            failed = row["failed"] + 1
            if failed >= 5:
                until = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
                c.execute("UPDATE users SET failed=0, locked_until=? WHERE id=?", (until, row["id"]))
            else:
                c.execute("UPDATE users SET failed=? WHERE id=?", (failed, row["id"]))
    
    if not ok:
        return jsonify({"ok": False, "error": bad}), 401
    
    resp = jsonify({"ok": True, "username": row["username"], "data": data})
    return make_session_cookie(resp, row["username"])

def a_logout():
    token = request.cookies.get("qsid")
    if token:
        with SESSION_LOCK:
            SESSIONS.pop(token, None)
    resp = jsonify({"ok": True})
    resp.set_cookie("qsid", "", expires=0)
    return resp

def a_me():
    user = get_current_user()
    if not user:
        return jsonify({"ok": True, "loggedIn": False})
    with db() as c:
        row = c.execute("SELECT id, username FROM users WHERE username=?", (user,)).fetchone()
        if not row:
            return jsonify({"ok": True, "loggedIn": False})
        data = load_data(c, row["id"])
    return jsonify({"ok": True, "loggedIn": True, "username": row["username"], "data": data})

def a_save(req):
    user = get_current_user()
    if not user:
        return jsonify({"ok": False, "error": "Not logged in"}), 401
    vso = clamp(req.get("vso"), 0, 100_000_000)
    skin = clamp(req.get("skin"), 0, 5)
    raw = req.get("unlocks")
    unlocks = [isinstance(raw, list) and i < len(raw) and raw[i] is True for i in range(5)]
    hank = 1 if req.get("hank") is True else 0
    with db() as c:
        row = c.execute("SELECT id FROM users WHERE username=?", (user,)).fetchone()
        if not row:
            return jsonify({"ok": False, "error": "Not logged in"}), 401
        c.execute("UPDATE player_data SET vso=?, unlocks=?, hank=?, skin=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?",
                  (vso, json.dumps(unlocks), hank, skin, row["id"]))
    return jsonify({"ok": True})

def a_game(req):
    user = get_current_user()
    if not user:
        return jsonify({"ok": False, "error": "Not logged in"}), 401
    result = req.get("result")
    if result not in ("win", "loss"):
        return jsonify({"ok": False, "error": "Bad result"}), 400
    moves = clamp(req.get("moves"), 0, 1000)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with db() as c:
        row = c.execute("SELECT id FROM users WHERE username=?", (user,)).fetchone()
        if not row:
            return jsonify({"ok": False, "error": "Not logged in"}), 401
        uid = row["id"]
        c.execute("INSERT INTO games(user_id, result, moves, played_at) VALUES(?,?,?,?)", (uid, result, moves, now))
        c.execute("DELETE FROM games WHERE user_id=? AND id NOT IN (SELECT id FROM games WHERE user_id=? ORDER BY id DESC LIMIT 10)", (uid, uid))
        games = recent_games(c, uid)
    return jsonify({"ok": True, "games": games})

def room_and_side(req):
    user = get_current_user()
    if not user:
        return None, jsonify({"ok": False, "error": "Log in to play online"}), 401
    code = str(req.get("code", "")).strip().upper()
    room = ROOMS.get(code)
    if not room:
        return None, jsonify({"ok": False, "error": "Room not found"}), 404
    side = side_of(room, user)
    if side is None:
        return None, jsonify({"ok": False, "error": "You are not in this room"}), 403
    room["touched"] = time.time()
    return (user, code, room, side), None, None

def a_room_create(req):
    user = get_current_user()
    if not user:
        return jsonify({"ok": False, "error": "Log in to play online"}), 401
    with ROOMS_LOCK:
        prune_rooms()
        if len(ROOMS) >= MAX_ROOMS:
            return jsonify({"ok": False, "error": "Too many rooms right now"}), 503
        for code, r in list(ROOMS.items()):
            if side_of(r, user) is not None and not r["over"]:
                if r["guest"] is None:
                    del ROOMS[code]
                else:
                    r["over"] = True
                    add_event(r, side_of(r, user), "left")
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(5))
        while code in ROOMS:
            code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(5))
        now = time.time()
        ROOMS[code] = {"host": user, "guest": None, "events": [], "seq": 0, "turn": 0,
                       "over": False, "seen": [now, now], "touched": now,
                       "skins": [clamp(req.get("skin"), 0, 5), 0]}
    return jsonify({"ok": True, "code": code, "side": 0})

def a_room_join(req):
    user = get_current_user()
    if not user:
        return jsonify({"ok": False, "error": "Log in to play online"}), 401
    code = str(req.get("code", "")).strip().upper()
    with ROOMS_LOCK:
        room = ROOMS.get(code)
        if not room or room["over"]:
            return jsonify({"ok": False, "error": "Room not found"}), 404
        if room["host"].lower() == user.lower():
            return jsonify({"ok": False, "error": "That is your own room."}), 400
        if room["guest"] is None:
            room["guest"] = user
            room["skins"][1] = clamp(req.get("skin"), 0, 5)
            room["seen"] = [time.time(), time.time()]
        elif room["guest"].lower() != user.lower():
            return jsonify({"ok": False, "error": "That room is already full"}), 409
        room["touched"] = time.time()
        res = {"ok": True, "code": code, "side": 1, "host": room["host"], "guest": room["guest"]}
    return jsonify(res)

def a_room_poll(req):
    with ROOMS_LOCK:
        got, err, code_num = room_and_side(req)
        if err:
            return err, code_num
        user, code, room, side = got
        room["seen"][side] = time.time()
        if room["guest"] is None and side == 0 and "skin" in req:
            room["skins"][0] = clamp(req.get("skin"), 0, 5)
        try:
            since = int(req.get("since", 0))
        except (TypeError, ValueError):
            since = 0
        out = {"ok": True, "started": room["guest"] is not None, "host": room["host"],
               "guest": room["guest"], "side": side, "over": room["over"],
               "events": [e for e in room["events"] if e["seq"] > since],
               "skins": room["skins"],
               "oppAgo": int(time.time() - room["seen"][1 - side])}
    return jsonify(out)

def a_room_mine():
    user = get_current_user()
    if not user:
        return jsonify({"ok": True, "code": None})
    with ROOMS_LOCK:
        for code, r in ROOMS.items():
            s = side_of(r, user)
            if s is not None and not r["over"]:
                return jsonify({"ok": True, "code": code, "side": s})
    return jsonify({"ok": True, "code": None})

def a_room_send(req):
    with ROOMS_LOCK:
        got, err, code_num = room_and_side(req)
        if err:
            return err, code_num
        user, code, room, side = got
        if room["guest"] is None:
            return jsonify({"ok": False, "error": "Waiting for opponent"}), 409
        t = req.get("t")
        if t in ("move", "wall"):
            if room["over"]:
                return jsonify({"ok": False, "error": "Game is over", "fatal": True}), 409
            pid = str(req.get("id", ""))
            try:
                n = int(req.get("n"))
            except (TypeError, ValueError):
                return jsonify({"ok": False, "error": "Bad turn number"}), 400
            if not ID_RE.match(pid):
                return jsonify({"ok": False, "error": "Bad id"}), 400
            if n == room["turn"] and n % 2 == side:
                add_event(room, side, t, id=pid, n=n)
                room["turn"] += 1
            elif n < room["turn"]:
                old = [e for e in room["events"] if e.get("n") == n]
                if not (old and old[0]["side"] == side and old[0]["t"] == t and old[0]["id"] == pid):
                    return jsonify({"ok": False, "error": "Out of sync", "fatal": True}), 409
            else:
                return jsonify({"ok": False, "error": "Not your turn", "fatal": True}), 409
        elif t == "resign":
            if not room["over"]:
                room["over"] = True
                add_event(room, side, "resign")
        elif t == "end":
            if not room["over"]:
                room["over"] = True
                add_event(room, side, "end")
        elif t == "forfeit":
            if room["over"]:
                return jsonify({"ok": True})
            if time.time() - room["seen"][1 - side] < FORFEIT_AFTER:
                return jsonify({"ok": False, "error": "Opponent is still connected"}), 409
            room["over"] = True
            add_event(room, 1 - side, "resign")
        else:
            return jsonify({"ok": False, "error": "Unknown event"}), 400
    return jsonify({"ok": True})

def a_room_leave(req):
    with ROOMS_LOCK:
        got, err, code_num = room_and_side(req)
        if err:
            return err, code_num
        user, code, room, side = got
        if room["guest"] is None:
            del ROOMS[code]
        elif not room["over"]:
            room["over"] = True
            add_event(room, side, "left")
    return jsonify({"ok": True})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
