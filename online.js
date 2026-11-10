// =====================================================================
// online.js  -  online 1v1 for Qurridor
// Runs in the browser, AFTER qurridor.js and auth.js.
//
// THE BIG IDEA:
//   Both computers run the full game. Every accepted move/wall is sent to the
//   server, and the other computer replays the same click on its own board.
//   The server only passes messages along and checks whose turn it is.
// =====================================================================

// Wrapped in a function so the variable names here don't clash with qurridor.js
(function () {

    // QA = the helper object that auth.js shares (it has QA.call to talk to the server)
    var QA = window.QA;
    if (!QA) return;                  // auth.js didn't load -> do nothing

    // QO = the state of the online match (also shared, so auth.js can read it)
    //   active : true while an online match is running
    //   side   : 0 = you are the host (player 1), 1 = you are the guest (player 2)
    //   code   : the 5-letter room code ("" = not in a room)
    //   over   : true once the match has ended
    //   since  : number of the last server event we already handled
    //   host/guest : usernames of the two players
    //   applyAll   : after a page refresh, replay ALL events (including my own) to rebuild the board
    //   msg    : an error/status message to show in the top bar
    //   oppSkin: the skin number (0-5) the OTHER player has equipped (-1 = unknown); qurridorS.js uses it to draw their pawn
    //   leave  : the leave() function below, shared so the "you won / you lost" box can call it
    var QO = window.QO = { active: false, side: 0, code: "", over: false, since: 0, host: "", guest: "", applyAll: false, msg: "", oppSkin: -1, leave: null };

    // Keep the game's ORIGINAL functions (with an underscore) because below we replace
    // the normal ones with versions that also talk to the server.
    var _move = move, _wallf = wallf, _game = game, _resignF = resignF, _setGameMode = setGameMode;

    // pollTimer : the timer that asks the server for news
    // q         : the waiting line of actions still to send to the server
    // sending   : true while one send is in progress
    // oppAgo    : seconds since the opponent last contacted the server
    // waiting   : true while the host sits in the "waiting for opponent" box
    var pollTimer = null, q = [], sending = false, oppAgo = 0, waiting = false;


    // ---------- small helpers ----------
    // myTurn(): tor counts the turns played. Even = host's turn, odd = guest's turn.
    function myTurn() { return tor % 2 === QO.side; }
    // oppName(): the other player's username
    function oppName() { return QO.side === 0 ? QO.guest : QO.host; }
    // setVso(): refresh the coins text on screen
    function setVso() { vsod.innerHTML = "vso:" + vso; }


    // ---------------------------------------------------------------
    // SENDING to the server (in order, with retry)
    // ---------------------------------------------------------------

    // enqueue(ev): add an action to the waiting line and try to send it
    function enqueue(ev) { q.push(ev); pump(); }

    // pump(): send the first action in the line; when it succeeds, send the next
    function pump() {
        if (sending || !q.length || !QO.code) return;   // busy, nothing to send, or not in a room
        sending = true;
        var body = { code: QO.code };                   // always include the room code
        for (var k in q[0]) body[k] = q[0][k];          // copy the action's details into the request
        QA.call("room_send", body).then(function (res) {
            sending = false;
            if (res.ok) { q.shift(); pump(); }          // sent OK -> remove it, send the next one
            else if (res.fatal) { q = []; desync(res.error); }   // server says we're out of sync
            else if (res.error === "Room not found") { q = []; QO.msg = "Room no longer exists"; QO.over = true; }
            else setTimeout(pump, 1000);                // network problem: try again in 1 second
        });
    }

    // desync(why): the two boards no longer agree -> stop the match and tell the player
    function desync(why) {
        QO.over = true;
        QO.msg = "Game out of sync (" + (why || "error") + "). Leave and start a new room.";
    }


    // ---------------------------------------------------------------
    // THE GAME WRAPPERS: replace the game's functions with online-aware versions
    // ---------------------------------------------------------------

    // act(kind, p): do a move or wall locally, and if the game accepted it, send it to the server
    function act(kind, p) {
        var before = tor, a = wina, b = winb;           // remember the turn number and win counters
        (kind === "move" ? _move : _wallf)(p);          // run the original game code
        if (tor !== before) {                           // the turn number changed = the game accepted it
            // for walls ask qurridorS.js for the real engine id (the guest's board is flipped,
            // so the slot the guest clicked is not the slot the wall really starts at)
            var sendId = (kind === "wall" && window.QWallAnchor) ? window.QWallAnchor(p) : p.id;
            enqueue({ t: kind, id: String(sendId), n: before });   // send: type, which square, turn number
            afterAction(a, b);                          // check if that action ended the game
        }                                               // otherwise it was illegal: nothing is sent
    }

    // move(p): clicking a square to move your pawn
    move = function (p) {
        if (!QO.active) return _move(p);                // not online -> normal game
        if (QO.over || !myTurn()) return;               // match over or not your turn -> ignore the click
        act("move", p);
    };

    // wallf(p): clicking a spot to place a wall
    wallf = function (p) {
        if (!QO.active) return _wallf(p);
        if (QO.over || !myTurn()) return;
        act("wall", p);
    };

    // resignF(): the resign button. Online it tells the server you gave up.
    resignF = function () {
        if (!QO.active) return _resignF();
        if (QO.over) return;
        enqueue({ t: "resign" });                       // tell the server
        applyResign(QO.side);                           // show the loss on my own screen
    };

    // Switching between computer / 2 players isn't allowed during an online match
    setGameMode = function (m) { if (!QO.active) _setGameMode(m); };


    // ---------------------------------------------------------------
    // RESULTS (who won, coins)
    // ---------------------------------------------------------------

    // afterAction(a, b): a and b are the win counters BEFORE the action.
    // The engine only knows "player 1 wins / player 2 wins" and gives coins to player 1 only,
    // so this function fixes the message and coins for whichever side you are.
    function afterAction(a, b) {
        if (wina === a && winb === b) return;           // counters didn't change -> game not over
        QO.over = true;
        var winner = wina > a ? 0 : 1, iWon = winner === QO.side;   // who won, and was it me
        del.innerHTML = (iWon ? "you win!" : "you lost!") + " <br /> <br /> click to leave";   // the result box
        if (winner === 0 && QO.side === 1) vso -= 100;  // engine gave the host's coins on my screen -> take them back
        if (winner === 1 && QO.side === 1) vso += 100;  // I'm the guest and won: engine gave nothing, so add them
        setVso();
        if (iWon) enqueue({ t: "end" });                // the winner tells the server the match is over
    }

    // applyResign(loser): someone resigned or left. loser = 0 (host) or 1 (guest).
    function applyResign(loser) {
        QO.over = true;
        var iLost = loser === QO.side;
        if (loser === 0) winb++; else wina++;           // give the point to the other side
        allow = 0;                                      // block further clicks in the game
        resign.style.display = "none";                  // hide the resign button
        rules.style.display = "none";                   // hide the rules/menu button
        del.classList = "win";                          // show the big result box
        del.style.display = "block";
        del.innerHTML = (iLost ? "you lost!" : "your opponent left - you win!") + " <br /> <br /> click to leave";
        if (!iLost) { vso += 100; setVso(); }           // the winner gets 100 coins
    }


    // ---------------------------------------------------------------
    // REPLAYING THE OPPONENT'S ACTIONS on my board
    // ---------------------------------------------------------------

    // applyEvent(e): e is one action from the server ({t: "move"/"wall"/"resign"/"left", id, side})
    function applyEvent(e) {
        if (e.t === "resign" || e.t === "left") { if (!QO.over) applyResign(e.side); return; }   // opponent quit
        if (e.t !== "move" && e.t !== "wall") return;   // ignore other kinds of events
        if (QO.over) return;                            // match already finished
        if (del.classList == "wce") del.style.display = "none";   // hide a leftover "illegal move" box
        allow = 1;                                      // make sure the game accepts clicks
        if (tor % 2 !== e.side) { desync("turn mismatch"); return; }   // the action came from the wrong side
        var before = tor, a = wina, b = winb;
        var run = (e.t === "move" ? _move : _wallf);        // the game's own function (the wrapped ones would refuse: not my turn)
        // "click" the same square on my board. recorder.js (if loaded) writes it into the game log on the way.
        if (window.QRecordRun) window.QRecordRun(run, e.t, { id: e.id }); else run({ id: e.id });
        if (tor === before) { desync("move rejected"); return; }   // my board refused it -> out of sync
        afterAction(a, b);                              // check if it ended the game
    }


    // ---------------------------------------------------------------
    // POLLING: ask the server for news twice a second
    // ---------------------------------------------------------------
    function poll() {
        if (!QO.code) return;                           // not in a room -> stop polling
        QA.call("room_poll", { code: QO.code, since: QO.since, skin: skinss }).then(function (res) {
            if (!QO.code) return;                       // we left while waiting for the answer
            if (res.ok) {
                oppAgo = res.oppAgo;                    // how long since the opponent was last seen
                if (!res.started && !waiting && QO.side === 0) showWaiting();   // refreshed while still waiting
                if (res.started && !QO.active) startMatch(res);                 // opponent joined -> start
                if (QO.active) {
                    res.events.forEach(function (e) {   // handle each new action, in order
                        if (e.seq <= QO.since) return;  // already handled
                        QO.since = e.seq;               // remember how far we got
                        if (e.side === QO.side && !QO.applyAll) return;   // my own action, already on my board
                        applyEvent(e);                  // replay the opponent's action
                    });
                    QO.applyAll = false;                // the full replay (after refresh) is done
                }
            } else if (res.error === "Room not found") {
                if (!QO.over) { QO.over = true; QO.msg = "Room no longer exists (the server may have restarted)."; }
            }
            if (QO.code) pollTimer = setTimeout(poll, 500);   // ask again in half a second
        });
    }

    // startMatch(res): both players are here -> set up the board and begin
    function startMatch(res) {
        QO.active = true;
        QO.over = false;
        QO.msg = "";
        QO.host = res.host; QO.guest = res.guest;       // remember both usernames
        // the server sends [host's skin, guest's skin]; keep the OTHER player's one so their pawn is drawn right.
        // This must be known BEFORE BuildGame() below, because the board is built with the pawn pictures.
        QO.oppSkin = res.skins ? res.skins[1 - QO.side] : -1;
        waiting = false;
        onlineNames = [res.host, res.guest];            // makes qurridor.js show the usernames in the score boxes
        iscomputerplaying = 0;                          // no computer opponent online
        panel.style.display = "none";                   // hide the lobby box
        if (del.classList == "wce") del.classList = "sbut";   // clear a leftover "illegal move" box
        BuildGame();                                    // build a fresh board
        refreshNames();                                 // update the name labels
        _game();                                        // start the game (original function)
        rules.style.display = "none";                   // hide the rules/menu button
    }

    // leave(): leave the room and reload the page
    function leave() {
        var code = QO.code;
        QO.code = ""; clearTimeout(pollTimer);          // stop polling
        var done = function () { location.reload(); };  // reloading gives a clean start
        if (!code) return done();
        QA.call("room_leave", { code: code }).then(done, done);   // tell the server, then reload
        setTimeout(done, 2500);                         // reload anyway after 2.5s if the server is slow
    }
    QO.leave = leave;                                   // qurridorS.js calls this when you click the "you won / you lost" box


    // ---------------------------------------------------------------
    // USER INTERFACE (lobby box and the status bar at the top)
    // ---------------------------------------------------------------

    // Add the CSS (styling). Each line styles one part:
    var css = document.createElement("style");
    css.textContent =
        // the lobby box in the middle of the top of the screen
        "#qo-panel{position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:9998;background:#14532d;color:#fff;border-radius:16px;box-shadow:8px 6px 2px #000;padding:20px 24px;width:300px;text-align:center;font:16px Verdana,sans-serif;display:none}" +
        // its heading
        "#qo-panel h3{margin:0 0 12px;color:#ff0}" +
        // the room-code input field (big letters, always uppercase)
        "#qo-panel input{width:100%;box-sizing:border-box;margin:6px 0;padding:10px;border-radius:8px;border:none;font-size:18px;text-align:center;text-transform:uppercase}" +
        // buttons in the lobby box and in the top status bar
        "#qo-panel button,#qo-status button{margin:6px 4px 0;padding:8px 14px;border-radius:10px;border:none;font-size:15px;cursor:pointer;background:#fff;color:#14532d}" +
        // the big yellow room code
        "#qo-code{font-size:38px;letter-spacing:6px;color:#ff0;margin:8px 0}" +
        // red error text
        "#qo-err{color:#fca5a5;min-height:18px;font-size:14px;margin-top:6px}" +
        // the white status bar at the top ("YOUR TURN" etc.)
        "#qo-status{position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:9997;background:#fff;color:#14532d;border-radius:10px;padding:5px 12px;font:15px Verdana,sans-serif;display:none;white-space:nowrap}";
    document.head.appendChild(css);

    // Create the (empty, hidden) lobby box and status bar
    var panel = document.createElement("div");
    panel.id = "qo-panel";
    document.body.appendChild(panel);
    var status = document.createElement("div");
    status.id = "qo-status";
    document.body.appendChild(status);

    // err(t): show a red error message in the lobby box
    function err(t) { var e = document.getElementById("qo-err"); if (e) e.textContent = t || ""; }

    // showMenu(): the first lobby screen - create a room or join one
    function showMenu() {
        waiting = false;
        panel.style.display = "block";
        panel.innerHTML =
            "<h3>Play online</h3>" +
            "<button id='qo-create'>Create a room</button>" +
            "<div style='margin:10px 0 2px'>or join a friend:</div>" +
            "<input id='qo-join-code' maxlength='5' placeholder='CODE'>" +
            "<button id='qo-join'>Join</button> <button id='qo-close'>Close</button>" +
            "<div id='qo-err'></div>";
        // connect the buttons
        document.getElementById("qo-create").onclick = createRoom;
        document.getElementById("qo-join").onclick = joinRoom;
        document.getElementById("qo-join-code").onkeydown = function (e) { if (e.key === "Enter") joinRoom(); };  // Enter = Join
        document.getElementById("qo-close").onclick = function () { panel.style.display = "none"; };
    }

    // showWaiting(): the host's screen while waiting for a friend (shows the room code)
    function showWaiting() {
        waiting = true;
        panel.style.display = "block";
        panel.innerHTML =
            "<h3>Waiting for opponent</h3>" +
            "Give this code to your friend:<div id='qo-code'>" + QO.code + "</div>" +
            "<div>They log in, click <b>online</b>, and join.</div>" +
            "<button id='qo-cancel'>Cancel</button><div id='qo-err'></div>";
        document.getElementById("qo-cancel").onclick = leave;   // cancel = delete the room and reload
    }

    // createRoom(): ask the server for a new room, become the host (side 0)
    function createRoom() {
        // skinss = my equipped skin; the server passes it on to my opponent
        QA.call("room_create", { skin: skinss }).then(function (res) {
            if (!res.ok) return err(res.error);         // e.g. not logged in
            QO.code = res.code; QO.side = 0; QO.since = 0; QO.applyAll = false;
            showWaiting(); poll();                      // show the code and start asking for news
        });
    }

    // joinRoom(): join a friend's room with the code, become the guest (side 1)
    function joinRoom() {
        var code = document.getElementById("qo-join-code").value.trim().toUpperCase();   // read the typed code
        if (!code) return err("Type the room code");
        QA.call("room_join", { code: code, skin: skinss }).then(function (res) {
            if (!res.ok) return err(res.error);         // e.g. wrong code, room full
            QO.code = res.code; QO.side = 1; QO.since = 0; QO.applyAll = false;
            poll();                                     // the match starts when poll sees "started"
        });
    }

    // claimWin(): the opponent vanished -> ask the server to give me the win
    function claimWin() { enqueue({ t: "forfeit" }); }

    // Every 0.4 seconds redraw the status bar at the top
    setInterval(function () {
        if (!QO.active) { status.style.display = "none"; return; }   // hide it outside online matches
        var text, claim = false;
        if (QO.msg) text = QO.msg;                      // an error/status message wins
        else if (QO.over) text = "Game over";
        else {
            text = "Online vs " + oppName() + " - " + (myTurn() ? "YOUR TURN" : "waiting for " + oppName());
            if (oppAgo > 15) {                          // opponent silent for 15+ seconds
                text += " (no signal for " + oppAgo + "s)";
                if (oppAgo > 45) claim = true;          // after 45s show the "claim win" button
            }
        }
        status.style.display = "block";
        status.innerHTML = "";                          // clear and rebuild the bar
        status.appendChild(document.createTextNode(text));
        if (claim) {
            var c = document.createElement("button"); c.textContent = "claim win"; c.onclick = claimWin; status.appendChild(c);
        }
        var l = document.createElement("button"); l.textContent = "leave"; l.onclick = leave; status.appendChild(l);   // always show "leave"
    }, 400);


    // ---------------------------------------------------------------
    // HOOK INTO THE LOGIN (auth.js calls this right after you log in)
    // ---------------------------------------------------------------
    QA.afterLogin = function () {
        // add an "online" button to the bottom-left bar
        var bar = document.getElementById("qa-bar");
        if (bar) {
            var b = document.createElement("button");
            b.textContent = "online";
            b.onclick = function () {
                // already in a room/match: just show or hide the lobby box
                if (QO.active || waiting) { panel.style.display = panel.style.display === "block" ? "none" : "block"; return; }
                showMenu();                             // otherwise open the create/join screen
            };
            bar.appendChild(b);
        }
        // Did you refresh the page in the middle of a match? Ask the server and rejoin it.
        QA.call("room_mine", {}).then(function (res) {
            if (res.ok && res.code && !QO.code) {
                QO.code = res.code; QO.side = res.side; QO.since = 0;
                QO.applyAll = true;                     // replay every event so the board is rebuilt exactly
                poll();
            }
        });
    };
})();
