#!/usr/bin/env python3
"""Qurridor server: serves the game and handles login + saved progress.
Only uses Python's standard library (no pip install needed). Database: SQLite file qurridor.db.

Run:   python server.py              (open http://localhost:8000)
Other PCs on your network:  python server.py --host 0.0.0.0
"""
import argparse, hashlib, hmac, json, mimetypes, os, re, secrets, sqlite3, threading, time
from datetime import datetime, timedelta, timezone
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote
from flask import Flask
app = Flask(__name__)
ROOT = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT, "qurridor.db")
ITERATIONS = 200_000
NAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")
STATIC_EXT = {".html", ".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".gif",
              ".svg", ".ico", ".mp3", ".ogg", ".wav", ".woff", ".woff2", ".json"}
mimetypes.add_type("image/webp", ".webp")

SESSIONS = {}            # token -> (username, expires)
SESSION_LOCK = threading.Lock()
SESSION_HOURS = 24
SECURE_COOKIE = False    # set by --https


# ---------- online 1v1 rooms (kept in memory; lost if the server restarts) ----------
ROOMS = {}
ROOMS_LOCK = threading.Lock()
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ROOM_TTL = 3 * 3600
MAX_ROOMS = 500
ID_RE = re.compile(r"^\d{1,4}$")
FORFEIT_AFTER = 45  # seconds without a signal before the other player may claim the win


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
    rows = c.execute("SELECT result, moves, played_at FROM games WHERE user_id=? ORDER BY id DESC LIMIT 10",
                     (uid,)).fetchall()
    return [{"result": r["result"], "moves": r["moves"], "at": r["played_at"]} for r in rows]


def load_data(c, uid):
    games = recent_games(c, uid)
    r = c.execute("SELECT vso, unlocks, hank, skin FROM player_data WHERE user_id=?", (uid,)).fetchone()
    if not r:
        return {"vso": 1000, "unlocks": [False] * 5, "hank": False, "skin": 0, "games": games}
    return {"vso": r["vso"], "unlocks": json.loads(r["unlocks"]), "hank": bool(r["hank"]),
            "skin": r["skin"], "games": games}


def clamp(v, lo, hi):
    try:
        v = int(v)
    except (TypeError, ValueError):
        v = 0
    return max(lo, min(hi, v))


class Handler(BaseHTTPRequestHandler):
    server_version = "Qurridor"
    protocol_version = "HTTP/1.1"

    # ---------- plumbing ----------
    def log_message(self, fmt, *args):
        pass  # quiet; remove this method to see request logs

    def send_json(self, code, obj, extra_headers=None):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (extra_headers or []):
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def fail(self, code, msg):
        self.send_json(code, {"ok": False, "error": msg})

    def current_user(self):
        raw = self.headers.get("Cookie")
        if not raw:
            return None
        try:
            tok = cookies.SimpleCookie(raw)["qsid"].value
        except Exception:
            return None
        with SESSION_LOCK:
            s = SESSIONS.get(tok)
            if not s:
                return None
            if s[1] < datetime.now(timezone.utc):
                del SESSIONS[tok]
                return None
            return s[0]

    def cookie_header(self, token, max_age):
        parts = [f"qsid={token}", "Path=/", "HttpOnly", "SameSite=Lax", f"Max-Age={max_age}"]
        if SECURE_COOKIE:
            parts.append("Secure")
        return ("Set-Cookie", "; ".join(parts))

    def start_session(self, username):
        tok = secrets.token_urlsafe(32)
        with SESSION_LOCK:
            SESSIONS[tok] = (username, datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS))
        return self.cookie_header(tok, SESSION_HOURS * 3600)

    # ---------- static files ----------
    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        if path in ("", "/"):
            path = "/index.html"
        full = os.path.realpath(os.path.join(ROOT, path.lstrip("/")))
        ext = os.path.splitext(full)[1].lower()
        if not full.startswith(ROOT + os.sep) or ext not in STATIC_EXT or not os.path.isfile(full):
            body = b"Not found"
            self.send_response(404)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        with open(full, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(full)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    # ---------- API ----------
    def do_POST(self):
        u = urlparse(self.path)
        if u.path != "/api":
            return self.fail(404, "Not found")
        if not (self.headers.get("Content-Type") or "").lower().startswith("application/json"):
            return self.fail(415, "JSON required")  # blocks simple cross-site form posts
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = 0
        if n > 4096:
            return self.fail(413, "Too large")
        try:
            req = json.loads(self.rfile.read(n) or b"{}")
            if not isinstance(req, dict):
                raise ValueError
        except ValueError:
            return self.fail(400, "Bad JSON")

        action = (parse_qs(u.query).get("a") or [""])[0]
        try:
            fn = {"register": self.a_register, "login": self.a_login, "logout": self.a_logout,
                  "me": self.a_me, "save": self.a_save, "game": self.a_game,
                  "room_create": self.a_room_create, "room_join": self.a_room_join,
                  "room_poll": self.a_room_poll, "room_mine": self.a_room_mine,
                  "room_send": self.a_room_send, "room_leave": self.a_room_leave}.get(action)
            if not fn:
                return self.fail(400, "Unknown action")
            fn(req)
        except sqlite3.Error:
            self.fail(500, "Server error")

    def a_register(self, req):
        user = str(req.get("username", "")).strip()
        pw = str(req.get("password", ""))
        if not NAME_RE.match(user):
            return self.fail(400, "Username must be 3-20 letters, numbers or _")
        if not 8 <= len(pw) <= 100:
            return self.fail(400, "Password must be 8-100 characters")
        salt = secrets.token_bytes(16)
        h = hash_pw(pw, salt)
        try:
            with db() as c:
                cur = c.execute("INSERT INTO users(username, pw_hash, salt) VALUES(?,?,?)", (user, h, salt))
                uid = cur.lastrowid
                c.execute("INSERT INTO player_data(user_id) VALUES(?)", (uid,))
                data = load_data(c, uid)
        except sqlite3.IntegrityError:
            return self.fail(409, "That username is taken")
        self.send_json(200, {"ok": True, "username": user, "data": data}, [self.start_session(user)])

    def a_login(self, req):
        user = str(req.get("username", "")).strip()
        pw = str(req.get("password", ""))
        bad = "Wrong username or password"
        with db() as c:
            row = c.execute("SELECT * FROM users WHERE username=?", (user,)).fetchone() if NAME_RE.match(user) else None
            if not row:
                hash_pw(pw, b"\0" * 16)  # equalise timing
                return self.fail(401, bad)
            if row["locked_until"]:
                if datetime.fromisoformat(row["locked_until"]) > datetime.now(timezone.utc):
                    return self.fail(429, "Too many attempts. Try again in a few minutes.")
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
            return self.fail(401, bad)
        self.send_json(200, {"ok": True, "username": row["username"], "data": data},
                       [self.start_session(row["username"])])

    def a_logout(self, req):
        raw = self.headers.get("Cookie")
        if raw:
            try:
                tok = cookies.SimpleCookie(raw)["qsid"].value
                with SESSION_LOCK:
                    SESSIONS.pop(tok, None)
            except Exception:
                pass
        self.send_json(200, {"ok": True}, [self.cookie_header("", 0)])

    def a_me(self, req):
        user = self.current_user()
        if not user:
            return self.send_json(200, {"ok": True, "loggedIn": False})
        with db() as c:
            row = c.execute("SELECT id, username FROM users WHERE username=?", (user,)).fetchone()
            if not row:
                return self.send_json(200, {"ok": True, "loggedIn": False})
            data = load_data(c, row["id"])
        self.send_json(200, {"ok": True, "loggedIn": True, "username": row["username"], "data": data})

    def a_save(self, req):
        user = self.current_user()
        if not user:
            return self.fail(401, "Not logged in")
        vso = clamp(req.get("vso"), 0, 100_000_000)
        skin = clamp(req.get("skin"), 0, 5)
        raw = req.get("unlocks")
        unlocks = [isinstance(raw, list) and i < len(raw) and raw[i] is True for i in range(5)]
        hank = 1 if req.get("hank") is True else 0
        with db() as c:
            row = c.execute("SELECT id FROM users WHERE username=?", (user,)).fetchone()
            if not row:
                return self.fail(401, "Not logged in")
            c.execute("UPDATE player_data SET vso=?, unlocks=?, hank=?, skin=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?",
                      (vso, json.dumps(unlocks), hank, skin, row["id"]))
        self.send_json(200, {"ok": True})

    def a_game(self, req):
        """Record a finished game; keep only the newest 10 per player."""
        user = self.current_user()
        if not user:
            return self.fail(401, "Not logged in")
        result = req.get("result")
        if result not in ("win", "loss"):
            return self.fail(400, "Bad result")
        moves = clamp(req.get("moves"), 0, 1000)
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        with db() as c:
            row = c.execute("SELECT id FROM users WHERE username=?", (user,)).fetchone()
            if not row:
                return self.fail(401, "Not logged in")
            uid = row["id"]
            c.execute("INSERT INTO games(user_id, result, moves, played_at) VALUES(?,?,?,?)",
                      (uid, result, moves, now))
            c.execute("DELETE FROM games WHERE user_id=? AND id NOT IN "
                      "(SELECT id FROM games WHERE user_id=? ORDER BY id DESC LIMIT 10)", (uid, uid))
            games = recent_games(c, uid)
        self.send_json(200, {"ok": True, "games": games})

    # ---------- online rooms ----------
    def room_and_side(self, req):
        """Return (user, code, room, side) for the logged-in player, or None after replying with an error."""
        user = self.current_user()
        if not user:
            self.fail(401, "Log in to play online")
            return None
        code = str(req.get("code", "")).strip().upper()
        room = ROOMS.get(code)
        if not room:
            self.fail(404, "Room not found")
            return None
        side = side_of(room, user)
        if side is None:
            self.fail(403, "You are not in this room")
            return None
        room["touched"] = time.time()
        return user, code, room, side

    def a_room_create(self, req):
        user = self.current_user()
        if not user:
            return self.fail(401, "Log in to play online")
        with ROOMS_LOCK:
            prune_rooms()
            if len(ROOMS) >= MAX_ROOMS:
                return self.fail(503, "Too many rooms right now")
            for code, r in list(ROOMS.items()):   # one open room per player
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
                           "skins": [clamp(req.get("skin"), 0, 5), 0]}   # skins[0] = host's equipped skin, skins[1] = guest's
        self.send_json(200, {"ok": True, "code": code, "side": 0})

    def a_room_join(self, req):
        user = self.current_user()
        if not user:
            return self.fail(401, "Log in to play online")
        code = str(req.get("code", "")).strip().upper()
        with ROOMS_LOCK:
            room = ROOMS.get(code)
            if not room or room["over"]:
                return self.fail(404, "Room not found")
            if room["host"].lower() == user.lower():
                return self.fail(400, "That is your own room. Give the code to your opponent.")
            if room["guest"] is None:
                room["guest"] = user
                room["skins"][1] = clamp(req.get("skin"), 0, 5)   # remember the guest's equipped skin
                room["seen"] = [time.time(), time.time()]
            elif room["guest"].lower() != user.lower():
                return self.fail(409, "That room is already full")
            room["touched"] = time.time()
            res = {"ok": True, "code": code, "side": 1, "host": room["host"], "guest": room["guest"]}
        self.send_json(200, res)

    def a_room_poll(self, req):
        with ROOMS_LOCK:
            got = self.room_and_side(req)
            if not got:
                return
            user, code, room, side = got
            room["seen"][side] = time.time()
            if room["guest"] is None and side == 0 and "skin" in req:
                room["skins"][0] = clamp(req.get("skin"), 0, 5)   # host changed skin while waiting
            try:
                since = int(req.get("since", 0))
            except (TypeError, ValueError):
                since = 0
            out = {"ok": True, "started": room["guest"] is not None, "host": room["host"],
                   "guest": room["guest"], "side": side, "over": room["over"],
                   "events": [e for e in room["events"] if e["seq"] > since],
                   "skins": room["skins"],   # [host's skin, guest's skin] so both players can draw both pawns
                   "oppAgo": int(time.time() - room["seen"][1 - side])}
        self.send_json(200, out)

    def a_room_mine(self, req):
        user = self.current_user()
        if not user:
            return self.send_json(200, {"ok": True, "code": None})
        with ROOMS_LOCK:
            for code, r in ROOMS.items():
                s = side_of(r, user)
                if s is not None and not r["over"]:
                    return self.send_json(200, {"ok": True, "code": code, "side": s})
        self.send_json(200, {"ok": True, "code": None})

    def a_room_send(self, req):
        with ROOMS_LOCK:
            got = self.room_and_side(req)
            if not got:
                return
            user, code, room, side = got
            if room["guest"] is None:
                return self.fail(409, "Waiting for opponent")
            t = req.get("t")
            if t in ("move", "wall"):
                if room["over"]:
                    return self.send_json(409, {"ok": False, "error": "Game is over", "fatal": True})
                pid = str(req.get("id", ""))
                try:
                    n = int(req.get("n"))
                except (TypeError, ValueError):
                    return self.fail(400, "Bad turn number")
                if not ID_RE.match(pid):
                    return self.fail(400, "Bad id")
                if n == room["turn"] and n % 2 == side:
                    add_event(room, side, t, id=pid, n=n)
                    room["turn"] += 1
                elif n < room["turn"]:
                    old = [e for e in room["events"] if e.get("n") == n]
                    if not (old and old[0]["side"] == side and old[0]["t"] == t and old[0]["id"] == pid):
                        return self.send_json(409, {"ok": False, "error": "Out of sync", "fatal": True})
                else:
                    return self.send_json(409, {"ok": False, "error": "Not your turn", "fatal": True})
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
                    return self.send_json(200, {"ok": True})
                if time.time() - room["seen"][1 - side] < FORFEIT_AFTER:
                    return self.fail(409, "Opponent is still connected")
                room["over"] = True
                add_event(room, 1 - side, "resign")
            else:
                return self.fail(400, "Unknown event")
        self.send_json(200, {"ok": True})

    def a_room_leave(self, req):
        with ROOMS_LOCK:
            got = self.room_and_side(req)
            if not got:
                return
            user, code, room, side = got
            if room["guest"] is None:
                del ROOMS[code]
            elif not room["over"]:
                room["over"] = True
                add_event(room, side, "left")
        self.send_json(200, {"ok": True})


def main():
    global SECURE_COOKIE
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1", help="use 0.0.0.0 to allow other devices")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--https", action="store_true", help="mark cookies Secure (use when behind an HTTPS proxy)")
    a = ap.parse_args()
    SECURE_COOKIE = a.https
    init_db()
    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    print(f"Qurridor running at http://{'localhost' if a.host in ('127.0.0.1', '0.0.0.0') else a.host}:{a.port}/  (Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
