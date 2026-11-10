// =====================================================================
// history.js - saves every finished game and replays it step by step
// Logged-in players: the games are saved in the SERVER database (so they follow you to any computer).
// Guests: the games stay in this browser (localStorage), as before.
// Load it AFTER recorder.js (the last script in the page):
//     <script src="recorder.js"></script>
//     <script src="history.js"></script>
//
//   1. a small "database" of finished games (server database for accounts, this browser for guests)
//   2. a "history" button on the main menu that lists the saved games
//   3. a replay bar with a  back  and a  forward  button (and the left / right arrow keys)
// =====================================================================
(function () {

    // ---------------------------------------------------------------
    // 1. THE DATABASE
    // Each saved game looks like:
    //   { id, t: time saved, mode: "computer" | "2 players" | "online", level: 2|3|4 (computer games),
    //     p1: name of player 1, p2: name of player 2, winner: 1 | 2 | 0 (0 = unknown),
    //     log: ["m4","m1","w127", ...] }       m + number = pawn move 1-12, w + number = wall slot id
    // The turn order never changes (player 1, player 2, player 1, ...), so the player is not stored.
    // ---------------------------------------------------------------
    var MAX_GAMES = 100;                                // the oldest games are dropped after this many

    // one list per logged-in user (everyone not logged in shares "guest")
    function storageKey() { return "qurridor_history:" + (qurridorUser ? qurridorUser : "guest"); }

    // gameLog entries -> short text codes, and back
    function encode(log) {
        return log.map(function (e) { return e.t === 'm' ? "m" + e.m : "w" + e.id; });
    }
    function decode(codes) {
        return codes.map(function (c, i) {
            var e = { n: i + 1, p: (i % 2 === 0) ? 1 : 2, t: c.charAt(0) };    // turn 1 = player 1, turn 2 = player 2, ...
            if (e.t === 'm') e.m = parseInt(c.slice(1), 10); else e.id = parseInt(c.slice(1), 10);
            return e;
        });
    }

    // ----- this browser's copy (guests, and the "outbox" of games not uploaded yet) -----
    function loadAll() {
        try {
            var a = JSON.parse(localStorage.getItem(storageKey()) || "[]");
            return Array.isArray(a) ? a : [];
        } catch (e) { return []; }                      // storage blocked or corrupted -> behave as empty
    }
    function storeAll(list) {
        try { localStorage.setItem(storageKey(), JSON.stringify(list)); return true; }
        catch (e) { return false; }
    }
    function removeLocal(id) { storeAll(loadAll().filter(function (g) { return g.id !== id; })); }

    // ----- the server copy (only for logged-in players) -----
    // useServer(): true when I am logged in (auth.js shares QA.isLoggedIn)
    function useServer() { return !!(window.QA && QA.isLoggedIn && QA.isLoggedIn()); }
    var cache = [];                                     // my games as the server has them, newest first
    var syncing = false;                                // true while an upload / download is running
    function newestFirst(a, b) { return b.t - a.t; }

    // sync(done): 1) upload every game still waiting in this browser, 2) download the list from the server.
    // A game that cannot be uploaded right now (server asleep, no internet) stays in the browser and is tried again later.
    function sync(done) {
        if (!useServer() || syncing) { if (done) done(); return; }
        syncing = true;
        var waiting = loadAll().slice().reverse();      // oldest first, so the order is kept
        function finish() { syncing = false; if (done) done(); }
        function download() {
            QA.call("hist_list", {}).then(function (res) {
                if (res.ok) cache = res.games;
                finish();
            });
        }
        function next() {
            if (!waiting.length) return download();
            var g = waiting[0];
            QA.call("hist_save", g).then(function (res) {
                // saved - or the server says it can never be saved (bad data): either way take it out of the outbox
                if (res.ok || res.error === "Bad game" || res.error === "Bad moves" || res.error === "Too large") {
                    removeLocal(g.id);
                    waiting.shift();
                    next();
                } else {
                    finish();                           // not logged in / server unreachable: keep it for later
                }
            });
        }
        next();
    }

    // list(): everything to show. Logged in = the server's games + any not uploaded yet. Guest = this browser's games.
    function list() {
        var local = loadAll();
        if (!useServer()) return local;
        var seen = {}, out = [];
        cache.concat(local).forEach(function (g) {
            if (!seen[g.id]) { seen[g.id] = true; out.push(g); }
        });
        out.sort(newestFirst);
        return out.slice(0, MAX_GAMES);
    }

    // QHistory = the database + the replay controls (usable from the console too)
    var DB = window.QHistory = {
        encode: encode,
        decode: decode,
        list: list,                                     // all saved games, newest first
        sync: sync,
        get: function (id) {
            return list().filter(function (g) { return g.id === id; })[0] || null;
        },
        save: function (rec) {                          // add a game at the top of the list
            // 1. always write it into this browser first, so it can never get lost
            var all = loadAll();
            all.unshift(rec);
            if (all.length > MAX_GAMES) all.length = MAX_GAMES;
            if (!storeAll(all)) {                       // storage full: keep only the newer half and try again
                all.length = Math.max(1, Math.floor(all.length / 2));
                storeAll(all);
            }
            // 2. logged in: show it at once and upload it to the server (this also removes it from the browser copy)
            if (useServer()) {
                cache.unshift(rec);
                sync();
            }
            return rec;
        },
        remove: function (id) {                         // delete one game
            removeLocal(id);
            cache = cache.filter(function (g) { return g.id !== id; });
            if (useServer()) QA.call("hist_delete", { id: id });
        },
        clear: function () {                            // delete all games
            storeAll([]);
            cache = [];
            if (useServer()) QA.call("hist_clear", {});
        }
    };

    // right after logging in: upload the games saved earlier in this browser and load my list from the server
    if (window.QA) {
        var afterLoginBefore = QA.afterLogin;
        QA.afterLogin = function (res) {
            if (afterLoginBefore) afterLoginBefore(res);
            sync();
        };
    }
    // every minute: try again to upload games that could not be uploaded (server was asleep, no internet)
    setInterval(function () { if (useServer() && loadAll().length) sync(); }, 60000);


    // ---------------------------------------------------------------
    // 2. SAVING: every time a game ends
    // ---------------------------------------------------------------
    var startWins = [0, 0];                             // the win counters when this game began
    var lastSaved = null;                               // the gameLog array we already saved (so it is saved once)

    // every new board remembers the win counters, so we can tell who won afterwards
    var _BuildGame = BuildGame;
    BuildGame = function () {
        startWins = [wina, winb];
        return _BuildGame();
    };

    // saveFinishedGame(): called when the "you win / you lost" box appears
    function saveFinishedGame() {
        if (replay.active) return;                      // never save a replay
        if (!gameLog.length || lastSaved === gameLog) return;   // nothing played, or already saved
        lastSaved = gameLog;
        var winner = wina > startWins[0] ? 1 : (winb > startWins[1] ? 2 : 0);   // the engine adds 1 to the winner's counter
        var online = window.QO && QO.active;
        DB.save({
            id: Date.now() + "-" + Math.floor(Math.random() * 1e6),
            t: Date.now(),
            mode: online ? "online" : (iscomputerplaying ? "computer" : "2 players"),
            level: iscomputerplaying && !online ? aiDepth : 0,
            p1: p1Name(),
            p2: p2Name(),
            winner: winner,
            log: encode(gameLog)
        });
    }

    // The result box is the element `del`; the game gives it the class "win" whenever a game ends
    // (a pawn reaches its goal, somebody resigns, the opponent leaves). Watch for that one change.
    new MutationObserver(function () {
        if (del.classList.contains("win")) saveFinishedGame();
    }).observe(del, { attributes: true, attributeFilter: ["class"] });


    // ---------------------------------------------------------------
    // 3. THE REPLAY
    // ---------------------------------------------------------------
    // replay.active : true while a replay is on screen
    // replay.rec    : the saved game being watched
    // replay.log    : its entries (decoded)
    // replay.pos    : how many entries are on the board right now (0 = the starting position)
    // replay.saved  : the game's own settings, put back when the replay closes
    var replay = { active: false, rec: null, log: [], pos: 0, saved: null };

    var MOVE_TEXT = {
        1: "stepped down", 2: "stepped right", 3: "stepped left", 4: "stepped up",
        5: "jumped right", 6: "jumped left", 7: "jumped down", 8: "jumped up",
        9: "moved diagonally up-right", 10: "moved diagonally down-right",
        11: "moved diagonally down-left", 12: "moved diagonally up-left"
    };
    var LEVEL_TEXT = { 2: "easy", 3: "medium", 4: "hard" };

    // describeStep(e): a sentence for one entry, e.g. "tom stepped up"
    function describeStep(e) {
        var who = e.p === 1 ? replay.rec.p1 : replay.rec.p2;
        if (e.t === 'm') return who + " " + (MOVE_TEXT[e.m] || "moved");
        return who + " placed a " + (wallFromId(e.id).orientation === 'h' ? "horizontal" : "vertical") + " wall";
    }

    // forward(): put the next entry on the board
    function forward() {
        if (!replay.active || replay.pos >= replay.log.length) return;
        if (playLogEntry(replay.log[replay.pos])) replay.pos++;
        updateBar();
    }
    // back(): take the last entry off the board
    function back() {
        if (!replay.active || replay.pos <= 0) return;
        if (undoLogEntry(replay.log[replay.pos - 1])) replay.pos--;
        updateBar();
    }

    // openReplay(id): show a saved game on the board, at its starting position
    function openReplay(id) {
        var rec = DB.get(id);
        if (!rec) return;
        closeList();
        replay.active = true;
        replay.rec = rec;
        replay.log = decode(rec.log);
        replay.pos = 0;
        replay.saved = { cpu: iscomputerplaying, names: onlineNames };   // remember the real settings
        iscomputerplaying = 0;                          // so the computer never reacts during a replay
        onlineNames = [rec.p1 || "player1", rec.p2 || "player2"];        // makes the board show the saved names
        BuildGame();                                    // a fresh board (this also empties gameLog - the replay uses its own copy)
        game();                                         // show the game screen
        flipBoard(false);                               // always show the board the normal way up
        allow = 0;                                      // clicks on the board do nothing during a replay
        resign.style.display = "none";                  // no resign button
        rules.style.display = "none";                   // and no menu icon: use the "close" button below
        refreshNames();
        bar.style.display = "block";
        updateBar();
    }

    // closeReplay(): back to the main menu, with the real settings put back
    function closeReplay() {
        if (!replay.active) return;
        replay.active = false;
        iscomputerplaying = replay.saved.cpu;
        onlineNames = replay.saved.names;
        bar.style.display = "none";
        goMainMenu();                                   // (from qurridorS.js) builds a fresh board and shows the menu
    }

    DB.open = openReplay;
    DB.forward = forward;
    DB.back = back;
    DB.close = closeReplay;


    // ---------------------------------------------------------------
    // 4. THE SCREEN PARTS
    // ---------------------------------------------------------------
    var css = document.createElement("style");
    css.textContent =
        // the "history" button on the main menu
        "#qh-btn{position:fixed;right:20px;bottom:20px;z-index:9996;padding:10px 18px;border-radius:12px;border:none;font:16px Verdana,sans-serif;cursor:pointer;background:#14532d;color:#fff;box-shadow:4px 4px 2px #000;display:none}" +
        // the list of games
        "#qh-panel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9998;background:#14532d;color:#fff;border-radius:16px;box-shadow:8px 6px 2px #000;padding:20px 24px;width:380px;max-height:70vh;overflow:auto;text-align:center;font:15px Verdana,sans-serif;display:none}" +
        "#qh-panel h3{margin:0 0 12px;color:#ff0}" +
        ".qh-row{background:rgba(0,0,0,.25);border-radius:10px;padding:8px 10px;margin:8px 0;text-align:left}" +
        ".qh-small{font-size:12px;opacity:.85}" +
        "#qh-panel button,#qh-bar button{margin:6px 4px 0;padding:7px 14px;border-radius:10px;border:none;font-size:15px;cursor:pointer;background:#fff;color:#14532d}" +
        "#qh-bar button:disabled{opacity:.4;cursor:default}" +
        // the replay bar at the top of the screen
        "#qh-bar{position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:9997;background:#fff;color:#14532d;border-radius:10px;padding:5px 12px;font:15px Verdana,sans-serif;display:none;white-space:nowrap}";
    document.head.appendChild(css);

    // make an element with some text
    function el(tag, text, cls) {
        var e = document.createElement(tag);
        if (text) e.textContent = text;                 // textContent, never innerHTML: names come from other players
        if (cls) e.className = cls;
        return e;
    }

    var btn = el("button", "history");
    btn.id = "qh-btn";
    btn.onclick = openList;
    document.body.appendChild(btn);

    var panel = el("div");
    panel.id = "qh-panel";
    document.body.appendChild(panel);

    // the replay bar:  [ back ]  step 3 / 18 - tom stepped up  [ forward ]  [ close ]
    var bar = el("div");
    bar.id = "qh-bar";
    var backBtn = el("button", "\u25C0 back");
    var label = el("span");
    var fwdBtn = el("button", "forward \u25B6");
    var closeBtn = el("button", "close");
    backBtn.onclick = back;
    fwdBtn.onclick = forward;
    closeBtn.onclick = closeReplay;
    bar.appendChild(backBtn);
    bar.appendChild(el("span", " "));
    bar.appendChild(label);
    bar.appendChild(el("span", " "));
    bar.appendChild(fwdBtn);
    bar.appendChild(closeBtn);
    document.body.appendChild(bar);

    // updateBar(): refresh the text and switch the buttons off at the start / end
    function updateBar() {
        var n = replay.log.length;
        var text = "step " + replay.pos + " / " + n;
        if (replay.pos === 0) text += " - start";
        else text += " - " + describeStep(replay.log[replay.pos - 1]);
        if (replay.pos === n) {
            var w = replay.rec.winner;
            text += w ? " - " + (w === 1 ? replay.rec.p1 : replay.rec.p2) + " won" : " - game over";
        }
        label.textContent = text;
        backBtn.disabled = replay.pos === 0;
        fwdBtn.disabled = replay.pos === n;
    }

    // closeList() / openList(): the list of saved games
    function closeList() { panel.style.display = "none"; }
    function openList() {
        renderList();
        sync(function () { if (panel.style.display === "block" && !replay.active) renderList(); });   // refresh from the server
    }
    function renderList() {
        var all = DB.list();
        panel.innerHTML = "";
        panel.appendChild(el("h3", "Game history"));
        if (!all.length) panel.appendChild(el("div", "No games saved yet. Finish a game and it shows up here."));
        all.forEach(function (rec) {
            var row = el("div", "", "qh-row");
            var winnerName = rec.winner === 1 ? rec.p1 : (rec.winner === 2 ? rec.p2 : "");
            var mode = rec.mode === "computer" ? "vs computer" + (LEVEL_TEXT[rec.level] ? " (" + LEVEL_TEXT[rec.level] + ")" : "") : rec.mode;
            row.appendChild(el("div", rec.p1 + " vs " + rec.p2));
            row.appendChild(el("div", (winnerName ? winnerName + " won" : "no winner saved") + " - " + rec.log.length + " turns - " + mode, "qh-small"));
            row.appendChild(el("div", new Date(rec.t).toLocaleString(), "qh-small"));
            var watch = el("button", "watch");
            watch.onclick = function () { openReplay(rec.id); };
            var del2 = el("button", "delete");
            del2.onclick = function () { DB.remove(rec.id); renderList(); };
            row.appendChild(watch);
            row.appendChild(del2);
            panel.appendChild(row);
        });
        if (all.length) {
            var clr = el("button", "delete all");
            clr.onclick = function () { DB.clear(); renderList(); };
            panel.appendChild(clr);
        }
        var cl = el("button", "close");
        cl.onclick = closeList;
        panel.appendChild(cl);
        panel.style.display = "block";
    }

    // the "history" button only shows on the main menu (where the title is showing)
    setInterval(function () {
        var onMenu = !replay.active && window.getComputedStyle(title).display !== "none";
        btn.style.display = onMenu ? "block" : "none";
        if (!onMenu && !replay.active) closeList();     // a game started -> close the list too
    }, 400);

    // left / right arrow keys step through the replay
    document.addEventListener("keydown", function (e) {
        if (!replay.active) return;
        if (e.key === "ArrowRight") forward();
        else if (e.key === "ArrowLeft") back();
    });
})();
