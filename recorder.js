// =====================================================================
// recorder.js - records every accepted move and wall so a game can be replayed
// Load it LAST, after qurridorS.js, auth.js and online.js:
//     <script src="recorder.js"></script>
// =====================================================================
(function () {

    // gameLog: one entry per turn, in the order they were played.
    //   pawn move: { n: 7, p: 1, t: 'm', m: 4 }      m  = move number 1-12 (table below)
    //   wall:      { n: 8, p: 2, t: 'w', id: 123 }   id = the wall slot id = row * 17 + col
    //   n = turn number (starts at 1), p = player who did it (1 or 2)
    window.gameLog = [];

    // Move numbers 1-12, in the same order the AI's generateMoves() lists them.
    // The key is "rowChange,colChange" on the 17x17 grid (a pawn step is 2 cells, a jump is 4).
    var MOVE_NUMBER = {
        "2,0": 1,     // down one
        "0,2": 2,     // right one
        "0,-2": 3,    // left one
        "-2,0": 4,    // up one
        "0,4": 5,     // jump right over the other pawn
        "0,-4": 6,    // jump left
        "4,0": 7,     // jump down
        "-4,0": 8,    // jump up
        "-2,2": 9,    // diagonal up-right
        "2,2": 10,    // diagonal down-right
        "2,-2": 11,   // diagonal down-left
        "-2,-2": 12   // diagonal up-left
    };

    // The opposite of each move number (handy for stepping back through a replay)
    var OPPOSITE = { 1: 4, 4: 1, 2: 3, 3: 2, 5: 6, 6: 5, 7: 8, 8: 7, 9: 11, 11: 9, 10: 12, 12: 10 };
    window.reverseMoveNumber = function (m) { return OPPOSITE[m] || null; };

    // wallFromId(id): a wall id contains its row and column.
    // Odd row = horizontal wall, even row = vertical wall (same rule wallf() uses).
    window.wallFromId = function (id) {
        var row = Math.floor(id / 17), col = id % 17;
        return { row: row, col: col, orientation: (row % 2 === 1) ? 'h' : 'v' };
    };

    // pawnPos(id): the engine keeps each pawn's position as a tile id (152 = player 1's start, 8 = player 2's start)
    function pawnPos(id) { return { row: Math.floor(id / 18) * 2, col: id % 18 }; }

    // whoMoves(): player 1 moves on even turns, player 2 on odd turns (tor counts the turns played)
    function whoMoves() { return tor % 2 === 0 ? 1 : 2; }

    // log(entry): add the next entry to the log
    function log(entry) {
        entry.n = gameLog.length + 1;
        gameLog.push(entry);
    }

    // Keep the game's original functions, then replace them with versions that also record
    var _move = move, _wallf = wallf, _placeComputerWall = placeComputerWall, _BuildGame = BuildGame;

    // ---- pawn moves (human clicks AND the computer, which also calls move()) ----
    move = function (p) {
        var before = tor, player = whoMoves();
        var from = pawnPos(player === 1 ? sidsp : idsp);        // where my pawn is BEFORE the move
        var result = _move(p);
        if (tor !== before) {                                   // turn number changed = the move was accepted
            var to = pawnPos(player === 1 ? sidsp : idsp);      // where it is now
            var m = MOVE_NUMBER[(to.row - from.row) + "," + (to.col - from.col)];
            log({ p: player, t: 'm', m: m });
        }
        return result;
    };

    // ---- walls placed by a human ----
    wallf = function (p) {
        var before = tor, player = whoMoves();
        var id = (p && p.id !== undefined) ? parseInt(p.id, 10) : NaN;
        // the REAL start slot can differ from the clicked slot (board flipped when you play second, or online guest)
        if (window.QWallAnchor) id = parseInt(window.QWallAnchor(p), 10);
        else if (iPlayP2() && !isNaN(id)) id -= (Math.floor(id / 17) % 2 === 1) ? 2 : 2 * 17;
        var result = _wallf(p);
        if (tor !== before && !isNaN(id)) log({ p: player, t: 'w', id: id });   // accepted -> record it
        return result;                                          // an illegal wall leaves tor unchanged, so nothing is recorded
    };

    // ---- walls placed by the computer (it does not go through wallf) ----
    placeComputerWall = function (orientation, pfp, psp) {
        var before = tor, player = whoMoves();
        _placeComputerWall(orientation, pfp, psp);
        if (tor !== before) log({ p: player, t: 'w', id: pfp * 17 + psp });
    };

    // ---- the opponent's actions in an online match ----
    // online.js replays the opponent's action with the ORIGINAL move/wall functions (the wrapped ones would
    // refuse it because it is not your turn), so those never reach the wrappers above.
    // online.js now runs them through this helper instead: fn = the original function, kind = "move" or "wall",
    // p = { id: ... } (for a wall, id is already the real start slot the sender used).
    window.QRecordRun = function (fn, kind, p) {
        var before = tor, player = whoMoves();
        var from = pawnPos(player === 1 ? sidsp : idsp);
        fn(p);
        if (tor === before) return;                             // the board refused it: nothing to record
        if (kind === "move") {
            var to = pawnPos(player === 1 ? sidsp : idsp);
            log({ p: player, t: 'm', m: MOVE_NUMBER[(to.row - from.row) + "," + (to.col - from.col)] });
        } else {
            log({ p: player, t: 'w', id: parseInt(p.id, 10) });
        }
    };

    // ---- a new board = a new game = an empty log ----
    BuildGame = function () {
        gameLog = [];
        return _BuildGame();
    };


    // =====================================================================
    // REPLAY: play a logged turn on the board, or take it back
    //   playLogEntry(x)   x = an entry from gameLog, or its index (0 = the first turn)
    //   undoLogEntry(x)   the exact reverse of playLogEntry
    //   resetBoardKeepLog()  a fresh board WITHOUT clearing gameLog (to replay from the start)
    // Both return true if they did something, false if the entry was missing or out of order.
    // They change the board directly (they do NOT go through move()/wallf()), so they
    // never record anything, never start the computer's turn and never trigger a win box.
    // =====================================================================

    // MOVE_DELTA[m] = how many grid cells move number m changes the row / column (MOVE_NUMBER the other way round)
    var MOVE_DELTA = {};
    Object.keys(MOVE_NUMBER).forEach(function (k) {
        var parts = k.split(",");
        MOVE_DELTA[MOVE_NUMBER[k]] = { dr: parseInt(parts[0], 10), dc: parseInt(parts[1], 10) };
    });

    // the html of an EMPTY pawn square / wall slot, built exactly like BuildGame() builds them
    function squareHtml(row, col) {
        return "<button id='" + (9 * row + col) + "' onclick='move(this)'  class='player-tiles' style='width:56px;height:56px'> </button>";   // (two spaces, exactly as BuildGame writes it)
    }
    function slotH(row, col) {   // empty horizontal-wall slot (odd rows)
        return "<button id='" + (row * 17 + col) + "' onclick='wallf(this)' class='wall-tilesb' style='width:56px;height:20px'> </button>";
    }
    function slotV(row, col) {   // empty vertical-wall slot (even rows)
        return "<button id='" + (row * 17 + col) + "' onclick='wallf(this)' class='wall-tilesa' style='width:20px;height:56px'> </button>";
    }

    // entryOf(x): accept a log entry or its index
    function entryOf(x) { return (typeof x === "number") ? gameLog[x] : x; }

    // movePawn(player, dr, dc): slide a player's pawn by (dr, dc) grid cells
    function movePawn(player, dr, dc) {
        var pos = pawnPos(player === 1 ? sidsp : idsp);          // where the pawn is now
        var nr = pos.row + dr, nc = pos.col + dc;                // where it goes
        var pawnHtml = arr[pos.row][pos.col];                    // the pawn's own html (it keeps its skin)
        arr[pos.row][pos.col] = squareHtml(pos.row, pos.col);    // the square it leaves becomes an empty square
        arr[nr][nc] = pawnHtml;                                  // put the pawn on the new square
        if (player === 1) sidsp = 9 * nr + nc; else idsp = 9 * nr + nc;   // the engine stores a pawn's position as an id
    }

    // setWall(w, on): w = wallFromId(...). on = true draws the wall, false removes it and restores the empty slots
    function setWall(w, on) {
        if (w.orientation === 'h') {                             // 3 cells in one row
            arr[w.row][w.col]     = on ? WALL_H : slotH(w.row, w.col);
            arr[w.row][w.col + 1] = on ? WALL_H_MID_MARKER : WALL_EMPTY_SLOT;
            arr[w.row][w.col + 2] = on ? WALL_H : slotH(w.row, w.col + 2);
        } else {                                                 // 3 cells in one column
            arr[w.row][w.col]     = on ? WALL_V : slotV(w.row, w.col);
            arr[w.row + 1][w.col] = on ? WALL_V_MID_MARKER : WALL_EMPTY_SLOT;
            arr[w.row + 2][w.col] = on ? WALL_V : slotV(w.row + 2, w.col);
        }
    }

    // useWall(player): a placed wall leaves the player's stack (and the counter goes down by 1)
    function useWall(player) {
        if (player === 1) { arrwf[walls] = ""; walls--; }
        else { arrwb[wallsb] = ""; wallsb--; }
    }
    // giveWallBack(player): the reverse - one bar goes back on the stack and the counter goes up by 1
    function giveWallBack(player) {
        if (player === 1) { walls++; arrwf[walls] = "<button class='wallsa' style='width:100px;height:10px'> </button></br> "; }
        else { wallsb++; arrwb[wallsb] = "<button class='wallsb' style='width:100px;height:10px'> </button></br> "; }
    }

    // refreshAfterReplay(): update the name labels (whose turn it is = full colour) and redraw the board + stacks
    function refreshAfterReplay() {
        arrwf[0] = "<div class='texta' style='opacity:" + (tor % 2 === 0 ? "100%" : "30%") + "'> " + p1Name() + ": " + walls + " </div>";
        arrwb[0] = "<div class='textb' style='opacity:" + (tor % 2 === 1 ? "100%" : "30%") + "'> " + p2Name() + ": " + wallsb + " </div>";
        var text = "", r, c, k;
        for (r = 0; r < arrrows; r++) {
            for (c = 0; c < arr[r].length; c++) text += arr[r][c];
            text += "</br> ";
        }
        games.innerHTML = text;
        text = ""; for (k = 0; k < 10; k++) text += arrwf[k];
        document.getElementById("tilea").innerHTML = text;
        text = ""; for (k = 0; k < 10; k++) text += arrwb[k];
        document.getElementById("tileb").innerHTML = text;
    }

    // playLogEntry(x): do one logged turn on the board
    window.playLogEntry = function (x) {
        var e = entryOf(x);
        if (!e || tor % 2 !== e.p - 1) return false;             // missing, or not that player's turn (entries must be played in order)
        if (e.t === 'm') {
            var d = MOVE_DELTA[e.m];
            if (!d) return false;                                // unknown move number
            movePawn(e.p, d.dr, d.dc);
        } else {
            setWall(wallFromId(e.id), true);
            useWall(e.p);
        }
        tor++;                                                   // the turn passes to the other player
        refreshAfterReplay();
        return true;
    };

    // undoLogEntry(x): take one logged turn back (undo the entries newest first)
    window.undoLogEntry = function (x) {
        var e = entryOf(x);
        if (!e || tor < 1 || (tor - 1) % 2 !== e.p - 1) return false;   // missing, or it was not the last turn played
        if (e.t === 'm') {
            var d = MOVE_DELTA[e.m];
            if (!d) return false;
            movePawn(e.p, -d.dr, -d.dc);                         // the same step the other way
        } else {
            setWall(wallFromId(e.id), false);
            giveWallBack(e.p);
        }
        tor--;                                                   // it is that player's turn again
        refreshAfterReplay();
        return true;
    };

    // resetBoardKeepLog(): a fresh board for replaying from the start. (A normal BuildGame() would empty gameLog.)
    window.resetBoardKeepLog = function () {
        var keep = gameLog;
        _BuildGame();
        gameLog = keep;
        refreshAfterReplay();
    };
})();
