// =====================================================================
// auth.js  -  login, saving your progress, and game history
// It runs in the browser, AFTER qurridor.js (so it can use the game's variables).
// It talks to the server (server.py) through the address "api".
// =====================================================================

// Everything is wrapped in "(function () { ... })();" so my variables
// stay private and can't clash with the variable names in qurridor.js.
(function () {

    // The server address that handles login/save/etc. (server.py answers "/api")
    var API = "api";

    // loggedIn  : true once you are logged in (guests stay false)
    // lastSaved : a text copy of what we last saved, so we only save when something changed
    // baseA/baseB: the win counters (wina/winb) the last time we looked, to spot a finished game
    // history   : the list of your last 10 games shown in the "history" popup
    var loggedIn = false, lastSaved = "", baseA = 0, baseB = 0,;


    // ---------------------------------------------------------------
    // call(action, body): send a request to the server and get the answer
    // Example: call("login", {username:"bob", password:"..."})
    // ---------------------------------------------------------------
    function call(action, body) {
        // fetch = the browser's way of sending a request to the server
        return fetch("/api?a=" + action, {          // e.g. "api?a=login"
            method: "POST",                           // we always send with POST
            credentials: "same-origin",               // include the login cookie
            headers: { "Content-Type": "application/json" },   // we are sending JSON text
            body: JSON.stringify(body || {})          // turn the data into JSON text
        }).then(function (r) {
            // read the server's answer as JSON; if it isn't valid, pretend it's an error
            return r.json().catch(function () { return { ok: false, error: "Server error" }; });
        }).catch(function () {
            // the request itself failed (server off, no internet, ...)
            return { ok: false, error: "Cannot reach server" };
        });
    }


    // ---------------------------------------------------------------
    // GAME STATE  <->  SERVER
    // ---------------------------------------------------------------

    // getState(): collect everything worth saving from the game's variables
    function getState() {
        return {
            vso: vso,                                                // your coins
            unlocks: [unlock1, unlock2, unlock3, unlock4, unlock5],  // which skins you bought
            hank: hank == 1,                                         // the extra flag from your game
            skin: skinss                                             // which skin is equipped (0-5)
        };
    }

    // applyState(d): put saved data (from the server) back into the game
    function applyState(d) {
        vso = d.vso;                                                 // restore coins
        unlock1 = !!d.unlocks[0]; unlock2 = !!d.unlocks[1]; unlock3 = !!d.unlocks[2];  // restore bought skins
        unlock4 = !!d.unlocks[3]; unlock5 = !!d.unlocks[4];          // (!! turns it into true/false)
        hank = d.hank ? 1 : 0;                                       // restore the flag
        skinss = d.skin; sid = d.skin;                               // restore the equipped skin
        vsod.innerHTML = "vso:" + vso;                               // update the coins text on screen

        // The 6 shop buttons, their pawn pictures, and whether you own each one
        var btns = [pa, pb, pc, pd, pe, pf];
        var imgs = [null, "pawn.png", "pawna.png", "player-pawngreen.jpeg", "playera-pawn.jpeg", "eeskin.jepg.webp"];
        var owned = [true, unlock1, unlock2, unlock3, unlock4, unlock5];   // skin 0 is free

        for (var i = 0; i < 6; i++) {
            // if you own this skin, show its picture on the button
            if (i > 0 && owned[i]) btns[i].style.backgroundImage = "url(" + imgs[i] + ")";
            // the equipped one says "equipped"
            if (i == skinss) btns[i].innerHTML = "<div class='eq'> equipped </div> ";
            // skins 1-4 you don't own yet show their price
            else if (i > 0 && i < 5 && !owned[i]) btns[i].innerHTML = "<div class='ueq'> cost:1000 </div>";
            // everything else shows nothing
            else btns[i].innerHTML = "";
        }

        lastSaved = JSON.stringify(getState());   // remember this state so we don't re-save it
        baseA = wina; baseB = winb;               // remember the win counters as the starting point
    }

    // save(useBeacon): send the current state to the server, but only if it changed
    function save(useBeacon) {
        if (!loggedIn) return;                    // guests are never saved
        var s = JSON.stringify(getState());       // current state as text
        if (s === lastSaved) return;              // nothing changed -> nothing to do
        lastSaved = s;
        if (useBeacon && navigator.sendBeacon) {
            // sendBeacon is a "fire and forget" send that still works while the page is closing
            navigator.sendBeacon(API + "?a=save", new Blob([s], { type: "application/json" }));
        } else {
            call("save", getState());             // normal save
        }
    }

    // Save automatically every 3 seconds (it skips the save if nothing changed)
    setInterval(function () { save(false); }, 3000);
    // Save when the page is closing or you switch to another tab
    window.addEventListener("pagehide", function () { save(true); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) save(true); });


    // ---------------------------------------------------------------
    // GAME HISTORY: notice when a game ends
    // ---------------------------------------------------------------

    // record(result): tell the server "this game was a win/loss", and refresh the list
function record(result, winner) {
    var online = window.QO && QO.active;
    call("game", {
        result: result, moves: tor,
        p1: p1Name(), p2: p2Name(),
        mode: online ? "online" : (iscomputerplaying ? "computer" : "2 players"),
        level: (iscomputerplaying && !online) ? aiDepth : 0,
        winner: winner,
        log: QHistory.encode(gameLog)
    });
}

setInterval(function () {
    if (!loggedIn) return;
    var guestSide = (window.QO && QO.active && QO.side === 1) || iPlayP2();
    if (wina > baseA) { baseA = wina; baseB = winb; record(guestSide ? "loss" : "win", 1); }
    else if (winb > baseB) { baseA = wina; baseB = winb; record(guestSide ? "win" : "loss", 2); }
}, 300);

    // Every 0.3 seconds, check if the game's win counters went up.
    // If they did, a game just finished.
    setInterval(function () {
        if (!loggedIn) return;                   // only logged-in players get history
        // In an online match the guest plays the engine's "player 2", so wins are flipped for them
        var guestSide = (window.QO && QO.active && QO.side === 1) || iPlayP2();        
if (wina > baseA) { baseA = wina; baseB = winb; record(guestSide ? "loss" : "win"); }       // player 1 side won
        else if (winb > baseB) { baseA = wina; baseB = winb; record(guestSide ? "win" : "loss"); }  // player 2 side won
    }, 300);


    // ---------------------------------------------------------------
    // USER INTERFACE (the login box, the bottom-left bar, the history popup)
    // ---------------------------------------------------------------

    // Add some CSS (styling) to the page. Each line styles one part:
    var css = document.createElement("style");
    css.textContent =
        // the dark full-screen background behind the login box (z-index = on top of everything)
        "#qa-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;font-family:Verdana,sans-serif}" +
        // the green login box itself
        "#qa-box{background:#14532d;color:#fff;border-radius:20px;box-shadow:12px 8px 2px #000;padding:28px 32px;width:300px;text-align:center}" +
        // the "Qurridor" heading in the box
        "#qa-box h2{margin:0 0 14px;color:#ff0}" +
        // the username and password text fields
        "#qa-box input{width:100%;box-sizing:border-box;margin:6px 0;padding:10px;border-radius:8px;border:none;font-size:16px}" +
        // the Log in / Register / guest buttons
        "#qa-box button{margin:8px 4px 0;padding:10px 16px;border-radius:10px;border:none;font-size:16px;cursor:pointer;background:#fff;color:#14532d}" +
        // the red error message under the buttons
        "#qa-msg{min-height:20px;margin-top:8px;color:#fca5a5;font-size:14px}" +
        // the small white bar in the bottom-left corner
        "#qa-bar{position:fixed;left:6px;bottom:6px;z-index:9998;background:#fff;border-radius:10px;padding:4px 10px;font:14px Verdana,sans-serif}" +
        // the buttons inside that bar (log out, history, online)
        "#qa-bar button{margin-left:8px;cursor:pointer}" +
        // lets the player-name boxes grow wider so long usernames fit
        ".texta,.textb,.textat,.textbt{width:auto!important;min-width:200px;padding:0 10px;box-sizing:border-box;white-space:nowrap}";
    document.head.appendChild(css);               // put the CSS into the page

    // Build the login box (HTML text) and add it to the page, hidden at first
    var overlay = document.createElement("div");
    overlay.id = "qa-overlay";
    overlay.innerHTML =
        "<div id='qa-box'><h2>Qurridor</h2>" +                                              // title
        "<input id='qa-user' placeholder='username' maxlength='20' autocomplete='username'>" +   // username field
        "<input id='qa-pass' type='password' placeholder='password (8+ chars)' maxlength='100' autocomplete='current-password'>" +  // password field (dots)
        "<div><button id='qa-login'>Log in</button><button id='qa-reg'>Register</button></div>" +   // the two main buttons
        "<div><button id='qa-guest'>Play as guest (no saving)</button></div>" +             // guest button
        "<div id='qa-msg'></div></div>";                                                    // where errors appear
    overlay.style.display = "none";               // hidden until we know you are not logged in
    document.body.appendChild(overlay);

    // $(id): a short name for "find the element with this id"
    function $(id) { return document.getElementById(id); }
    // msg(t): show a message (like an error) in the login box
    function msg(t) { $("qa-msg").textContent = t || ""; }


    // showBar(text, canLogout): show the little bar at the bottom-left
    //   text      = what it says (e.g. "player: bob")
    //   canLogout = true for real accounts, false for guests
    function showBar(text, canLogout) {
        var bar = $("qa-bar");
        if (!bar) { bar = document.createElement("div"); bar.id = "qa-bar"; document.body.appendChild(bar); }  // create it once
        bar.textContent = text;                                  // set the text
        var b = document.createElement("button");
        b.textContent = canLogout ? "log out" : "log in";        // guests get a "log in" button instead
        b.onclick = function () {
            if (canLogout) call("logout").then(function () { location.reload(); });   // tell the server, then reload the page
            else location.reload();                                                   // guest: reload to see the login box again
        };
        bar.appendChild(b);
    }


    // ---------------------------------------------------------------
    // LOGIN / REGISTER
    // ---------------------------------------------------------------

    // done(res): runs after the server answers a login/register/"me" request
    function done(res) {
        if (!res.ok) { msg(res.error || "Something went wrong"); return; }   // show the error and stop
        loggedIn = true;                       // we are in!
        applyState(res.data);                  // load coins, skins and history
        qurridorUser = res.username;           // tell qurridor.js your name (used for the score labels)
        BuildGame();                           // rebuild the board so your saved skin is used
        refreshNames();                        // update the name labels above the board
        overlay.style.display = "none";        // hide the login box
        showBar("player: " + res.username, true);   // show the bottom-left bar
        if (window.QA && QA.afterLogin) QA.afterLogin(res);   // let online.js add its "online" button
    }

    // submit(action): read the two text fields and send "login" or "register"
    function submit(action) {
        msg("");                               // clear the old error
        call(action, { username: $("qa-user").value, password: $("qa-pass").value }).then(done);
    }

    // Connect the buttons to the functions above
    $("qa-login").onclick = function () { submit("login"); };       // Log in button
    $("qa-reg").onclick = function () { submit("register"); };      // Register button
    $("qa-pass").onkeydown = function (e) { if (e.key === "Enter") submit("login"); };   // pressing Enter logs in
    $("qa-guest").onclick = function () {                           // guest button: hide the box, no saving
        overlay.style.display = "none";
        showBar("guest (progress not saved)", false);
    };

    // Share a few things with online.js (it is loaded after this file)
    window.QA = { call: call, afterLogin: null, isLoggedIn: function () { return loggedIn; } };

    // When the page opens: ask the server "am I already logged in?" (the cookie remembers you)
    call("me").then(function (res) {
        if (res.ok && res.loggedIn) done(res);          // yes -> log in automatically
        else overlay.style.display = "flex";            // no -> show the login box
    });
})();
