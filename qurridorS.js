var resign = document.getElementById("resign");
var del = document.getElementById("button");
var title = document.getElementById("title");
var rules = document.getElementById("rules");
var ff = document.getElementById("ff");
var games = document.getElementById("s");
var scorea = document.getElementById("scorea");
var scoreb = document.getElementById("scoreb");
var shop = document.getElementById("store")
var pa = document.getElementById("1000")
var pb = document.getElementById("1001")
var pc = document.getElementById("1002")
var pd = document.getElementById("1003")
var pe = document.getElementById("1004")
var pf = document.getElementById("1005")
var vsod = document.getElementById("vso")
var ogskin = document.getElementsByClassName("playera")
var settingsBtn = document.getElementById("settingsBtn");
var settings = document.getElementById("settings");
const WALL_H = "<button class='wallsbi' style='width:56px;height:20px'> </button>";
const WALL_V = "<button class='wallsbh' style='width:20px;height:56px'> </button>";
const WALL_H_MID_MARKER = "<button class='wallsbhx' style='width:20px;height:20px'> </button>";
const WALL_V_MID_MARKER = "<button class='wallsbh' style='width:20px;height:20px'> </button>";
const WALL_EMPTY_SLOT = "<button class='wall-tilesn' style='width:20px;height:20px'> </button>";
var drawgame = 1
var hank = 0
var ee = 0
var vso = 1000;
var skins = 0
var arrrows = 9
var tor = 0
var idnum = 0;
var idsp = 8
var sidsp = 152
var ti;
var walls = 9
var wallsb = 9
var wina = 0
var winb = 0
var skinss = 0
var unlock1 = false
var unlock2 = false
var unlock3 = false
var unlock4 = false
var unlock5 = false
var arrrows = 17
var allow = 1
var wc;
var wcb;
var col = 0
var row = 0
var mc = new Array(17)
var mcb = new Array(17)
var arr = new Array(arrrows)
var i, s;
var arrwf = new Array(1)
var mcr = new Array(17)
var arrwb = new Array(1)
var tidnum = 8;
var best = -1;
var Firstmax = Infinity
var Secondmax
var Firstsmax = Infinity
var Secondsmax
vsod.innerHTML = "vso:" + vso
BuildGame()
games.style.display = "none"
function game() {
    allow = 1
    if (del.classList == "wce") {
        del.style.display = "none"
    }
    else {
        vsod.innerHTML = "vso:" + vso
        scorea.innerHTML = wina
        scoreb.innerHTML = winb
        document.getElementById("resign").style.display = "block"
        games.classList = "game"
        games.style.display = "block"
        scorea.style.display = "block"
        scoreb.style.display = "block"
        scorea.classList = "scorea"
        scoreb.classList = "scoreb"
        shop.style.display = "none"
        ff.style.display = "none"
        pa.style.display = "none"
        pb.style.display = "none"
        pc.style.display = "none"
        pd.style.display = "none"
        pe.style.display = "none"
        pf.style.display = "none"
        title.style.display = "none"
        settingsBtn.style.display = "none"
        settings.style.display = "none"
        rules.classList = "bmm"
        rules.style.display = "block"
        rules.innerHTML = ""
        if (del.style.display == "block") {
            BuildGame()
        }
        if (del.style.display != "none") {
            del.style.display = "none"
        }
        var text = "";
        for (i = 0; i < arrrows; i++) {
            if (i % 2 == 0) {
                for (s = 0; s < arr[i].length; s++) {
                    text += arr[i][s]
                }
            }
            else {
                for (s = 0; s < arr[i].length; s++) {
                    text += arr[i][s]
                }
            }
            text += "</br> "
        }
        games.innerHTML = text
        text = "";
        for (i = 0; i < 10; i++) {
            text += arrwf[i]
        }
        document.getElementById("tilea").innerHTML = text
        text = "";
        for (i = 0; i < 10; i++) {
            text += arrwb[i]
        }
        document.getElementById("tileb").innerHTML = text
        document.getElementById("tilea").style.display = "block"
        document.getElementById("tileb").style.display = "block"
    }
}

function move(p) {
    if (allow == 1) {
        idnum = p.id
        var idc = (p.id)
        var sp = idc % 18;
        var fp = (Math.floor(idc / 18)) * 2
        var psp;
        var pfp;
        if (tor % 2 == 1) {
            psp = idsp % 18
            pfp = (Math.floor(idsp / 18)) * 2
            if (psp == sp - 2 && pfp == fp - 2 &&
                ((arr[pfp + 1][psp] != WALL_H && (pfp == 14 || arr[pfp + 3][psp] == WALL_H) && arr[pfp + 2][psp + 1] != WALL_V && arr[fp][sp - 2] == P1_TILE())
                    || (arr[pfp][psp + 1] != WALL_V && (psp == 14 || arr[pfp][psp + 3] == WALL_V) && arr[pfp + 1][psp + 2] != WALL_H && arr[fp - 2][sp] == P1_TILE()))) {//p2 right one down one

                idnum = Number(idnum) - 20
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                if (fp == 16) {
                    resign.style.display = "none"
                    winb++
                    rules.style.display = "none"
                    del.innerHTML = "you lost! <br /> <br /> click for the main menu"
                    del.style.display = "block"
                    del.classList = "win"
                    allow = 0
                    arr[fp][sp] = tidsp
                }

            }
            if (psp == sp + 2 && pfp == fp - 2 &&
                ((arr[pfp + 1][psp] != WALL_H && (pfp == 14 || arr[pfp + 3][psp] == WALL_H) && arr[pfp + 2][psp - 1] != WALL_V && arr[fp][sp + 2] == P1_TILE())
                    || (arr[pfp][psp - 1] != WALL_V && (psp == 2 || arr[pfp][psp - 3] == WALL_V) && arr[pfp + 1][psp - 2] != WALL_H && arr[fp - 2][sp] == P1_TILE()))) {//p2 left one down one
                idnum = Number(idnum) - 16
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                if (fp == 16) {
                    resign.style.display = "none"
                    winb++
                    rules.style.display = "none"
                    del.innerHTML = "you lost! <br /> <br /> click for the main menu"
                    del.style.display = "block"
                    del.classList = "win"
                    allow = 0
                    arr[fp][sp] = tidsp
                }
            }

            if (psp == sp + 2 && pfp == fp + 2 &&
                ((arr[pfp - 1][psp] != WALL_H && (pfp == 2 || arr[pfp - 3][psp] == WALL_H) && arr[pfp - 2][psp - 1] != WALL_V && arr[fp][sp + 2] == P1_TILE())
                    || (arr[pfp][psp - 1] != WALL_V && (psp == 2 || arr[pfp][psp - 3] == WALL_V) && arr[pfp - 1][psp - 2] != WALL_H && arr[fp + 2][sp] == P1_TILE()))) {//p2 left one up one
                idnum = Number(idnum) + 20
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"

            }
            if (psp == sp - 2 && pfp == fp + 2 &&
                ((arr[pfp - 1][psp] != WALL_H && (pfp == 2 || arr[pfp - 3][psp] == WALL_H) && arr[pfp - 2][psp + 1] != WALL_V && arr[fp][sp - 2] == P1_TILE())
                    || (arr[pfp][psp + 1] != WALL_V && (psp == 14 || arr[pfp][psp + 3] == WALL_V) && arr[pfp - 1][psp + 2] != WALL_H && arr[fp + 2][sp] == P1_TILE()))) {//p2 right one up one
                idnum = Number(idnum) + 16
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
            }
            if (psp == sp && pfp == fp - 4 && arr[pfp + 1][psp] != WALL_H && arr[pfp + 3][psp] != WALL_H) {//p2 down two
                if (arr[fp - 2][sp] == P1_TILE()) {
                    idnum = Number(idnum) - 36
                    arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    idsp = idc
                    tor++
                    arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                    if (fp == 16) {
                        resign.style.display = "none"
                        winb++
                        rules.style.display = "none"
                        del.innerHTML = "you lost! <br /> <br /> click for the main menu"
                        del.style.display = "block"
                        del.classList = "win"
                        allow = 0
                        arr[fp][sp] = tidsp
                    }
                }
            }
            if (psp == sp && pfp == fp + 4 && arr[pfp - 1][psp] != WALL_H && arr[pfp - 3][psp] != WALL_H) {
                if (arr[fp + 2][sp] == P1_TILE()) {//p2 up two
                    idnum = Number(idnum) + 36
                    arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                    arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    idsp = idc
                    tor++
                }
            }
            if (psp == sp + 4 && pfp == fp && arr[pfp][psp - 1] != WALL_V && arr[pfp][psp - 3] != WALL_V) {
                if (arr[fp][sp + 2] == P1_TILE()) {//p2 left two
                    idnum = Number(idnum) + 4
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    idsp = idc
                    arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                    arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                    tor++
                }
            }
            if (psp == sp - 4 && pfp == fp && arr[pfp][psp + 1] != WALL_V && arr[pfp][psp + 3] != WALL_V) {
                if (arr[fp][sp - 2] == P1_TILE()) {//p2 right two
                    idnum = Number(idnum) - 4
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    idsp = idc
                    tor++
                    arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                    arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                }
            }
            if (psp == sp && pfp == fp - 2 && arr[pfp + 1][psp] != WALL_H) {//p2 down one
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                idnum = Number(idnum) - 18
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                idnum = Number(idnum) - 4
                tor++
                if (fp == 16) {
                    winb++
                    rules.style.display = "none"
                    resign.style.display = "none"
                    del.innerHTML = "you lost! <br /> <br /> click for the main menu"
                    del.style.display = "block"
                    del.classList = "win"
                    allow = 0
                    arr[fp][sp] = tidsp
                }
            }
            if (psp == sp && pfp == fp + 2 && arr[pfp - 1][psp] != WALL_H) {//p2 up one
                idnum = Number(idnum) + 18
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                tor++
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"

            }
            if (psp == sp + 2 && pfp == fp && arr[pfp][psp - 1] != WALL_V) {//p2 left one
                idnum = Number(idnum) + 2
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                tor++
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
            }
            if (psp == sp - 2 && pfp == fp && arr[pfp][psp + 1] != WALL_V) {//p2 right one 
                arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                idnum = Number(idnum) - 2
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                idsp = idc
                tor++
            }
        }
        else {
            psp = sidsp % 18
            pfp = (Math.floor(sidsp / 18)) * 2
            if (psp == sp - 2 && pfp == fp - 2 &&
                ((arr[pfp + 1][psp] != WALL_H && (pfp == 14 || arr[pfp + 3][psp] == WALL_H) && arr[pfp + 2][psp + 1] != WALL_V && arr[fp][sp - 2] == P2_TILE())
                    || (arr[pfp][psp + 1] != WALL_V && (psp == 14 || arr[pfp][psp + 3] == WALL_V) && arr[pfp + 1][psp + 2] != WALL_H && arr[fp - 2][sp] == P2_TILE()))) {//p1 right one down one
                idnum = Number(idnum) - 20
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"

            }
            if (psp == sp + 2 && pfp == fp - 2 &&
                ((arr[pfp + 1][psp] != WALL_H && (pfp == 14 || arr[pfp + 3][psp] == WALL_H) && arr[pfp + 2][psp - 1] != WALL_V && arr[fp][sp + 2] == P2_TILE())
                    || (arr[pfp][psp - 1] != WALL_V && (psp == 2 || arr[pfp][psp - 3] == WALL_V) && arr[pfp + 1][psp - 2] != WALL_H && arr[fp - 2][sp] == P2_TILE()))) {//p1 left one down one
                idnum = Number(idnum) - 16
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
            }
            if (psp == sp + 2 && pfp == fp + 2 &&
                ((arr[pfp - 1][psp] != WALL_H && (pfp == 2 || arr[pfp - 3][psp] == WALL_H) && arr[pfp - 2][psp - 1] != WALL_V && arr[fp][sp + 2] == P2_TILE())
                    || (arr[pfp][psp - 1] != WALL_V && (psp == 2 || arr[pfp][psp - 3] == WALL_V) && arr[pfp - 1][psp - 2] != WALL_H && arr[fp + 2][sp] == P2_TILE()))) {//p1 left one up one
                idnum = Number(idnum) + 20
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                if (fp == 0) {
                    vso += 100
                    rules.style.display = "none"
                    resign.style.display = "none"
                    wina++
                    del.innerHTML = "you win! <br /> <br /> click for the main menu"
                    del.style.display = "block"
                    del.classList = "win"
                    allow = 0
                    arr[fp][sp] = tidsp
                }
            }
            if ((psp == sp - 2 && pfp == fp + 2) &&
                ((arr[pfp][psp + 1] != WALL_V && (psp == 14 || arr[pfp][psp + 3] == WALL_V) && arr[pfp - 1][psp + 2] != WALL_H && arr[fp + 2][sp] == P2_TILE())
                    || (arr[pfp - 1][psp] != WALL_H && (pfp == 2 || arr[pfp - 3][psp] == WALL_H) && arr[pfp - 2][psp + 1] != WALL_V && arr[fp][sp - 2] == P2_TILE()))) {//p1 right one up one
                idnum = Number(idnum) + 16
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                if (fp == 0) {
                    vso += 100
                    rules.style.display = "none"
                    resign.style.display = "none"
                    wina++
                    del.innerHTML = "you win! <br /> <br /> click for the main menu"
                    del.style.display = "block"
                    del.classList = "win"
                    allow = 0
                    arr[fp][sp] = tidsp
                }
            }
            if (psp == sp && pfp == fp - 4 && arr[pfp + 1][psp] != WALL_H && arr[pfp + 3][psp] != WALL_H) {//p1 down two
                if (arr[fp - 2][sp] == P2_TILE()) {
                    idnum = Number(idnum) - 36
                    arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                    arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    sidsp = idc
                    tor++
                }
            }
            if (psp == sp && pfp == fp + 4 && arr[pfp - 1][psp] != WALL_H && arr[pfp - 3][psp] != WALL_H) {//p1 up two
                if (arr[fp + 2][sp] == P2_TILE()) {
                    idnum = Number(idnum) + 36
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    sidsp = idc
                    tor++
                    arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                    arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                    if (fp == 0) {
                        vso += 100
                        rules.style.display = "none"
                        resign.style.display = "none"
                        wina++
                        del.innerHTML = "you win! <br /> <br /> click for the main menu"
                        del.style.display = "block"
                        del.classList = "win"
                        allow = 0
                    }
                }
            }
            if (psp == sp + 4 && pfp == fp && arr[pfp][psp - 1] != WALL_V && arr[pfp][psp - 3] != WALL_V) {//p1 left two
                if (arr[fp][sp + 2] == P2_TILE()) {
                    arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                    idnum = Number(idnum) + 4
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    sidsp = idc
                    tor++
                    arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                }
            }
            if (psp == sp - 4 && pfp == fp && arr[pfp][psp + 1] != WALL_V && arr[pfp][psp + 3] != WALL_V) {//p1 right two
                if (arr[fp][sp - 2] == P2_TILE()) {
                    arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                    idnum = Number(idnum) - 4
                    tidsp = arr[pfp][psp]
                    arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                    arr[fp][sp] = tidsp
                    sidsp = idc
                    tor++
                    arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                }
            }
            if (psp == sp && pfp == fp - 2 && arr[pfp + 1][psp] != WALL_H) { //p1 down one
                idnum = Number(idnum) - 18
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
            }
            if (psp == sp && pfp == fp + 2 && arr[pfp - 1][psp] != WALL_H) { //p1 up one
                idnum = Number(idnum) + 18
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                if (fp == 0) {
                    wina++
                    rules.style.display = "none"
                    resign.style.display = "none"
                    vso += 100
                    del.innerHTML = "you win! <br /> <br /> click for the main menu"
                    del.style.display = "block"
                    del.classList = "win"
                    allow = 0
                    arr[fp][sp] = tidsp
                }
            }
            if (psp == sp + 2 && pfp == fp && arr[pfp][psp - 1] != WALL_V) {//p1 left one
                idnum = Number(idnum) + 2
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
            }
            if (psp == sp - 2 && pfp == fp && arr[pfp][psp + 1] != WALL_V) {//p1 right one
                idnum = Number(idnum) - 2
                tidsp = arr[pfp][psp]
                arr[pfp][psp] = "<button id='" + idnum.toString() + "' onclick='move(this)' class='player-tiles' style='width:56px;height:56px'> </button>";
                arr[fp][sp] = tidsp
                sidsp = idc
                tor++
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
            }
        }
        runComputerTurn(600)
        var text = "";
        for (i = 0; i < arrrows; i++) {
            for (s = 0; s < arr[i].length; s++) {
                text += arr[i][s]
            }
            text += "</br> "
        }
        games.innerHTML = text
        text = "";
        for (i = 0; i < 10; i++) {
            text += arrwf[i]
        }
        document.getElementById("tilea").innerHTML = text
        text = "";
        for (i = 0; i < 10; i++) {
            text += arrwb[i]
        }
        document.getElementById("tileb").innerHTML = text
    }
}

function wallf(wl) {
    if (allow == 1) {
        var rc = 0
        var ffp
        var fsp
        var sfp
        var ssp
        for (i = 0; i < 17; i++) {
            mc[i] = new Array(17)
            for (s = 0; s < 17; s++) {
                mc[i][s] = arr[i][s]
            }
        }

        hidsp = wl.id
        psp = hidsp % 17
        pfp = (Math.floor(hidsp / 17))
        idnum = wl.id
        if (tor % 2 == 0 && walls > 0) {
            if (mc[pfp][psp + 1] != WALL_V_MID_MARKER && pfp % 2 == 1 && mc[pfp][psp + 2] != WALL_H && psp < 16) {
                mc[pfp][psp] = WALL_H
                mc[pfp][psp + 1] = WALL_H_MID_MARKER
                mc[pfp][psp + 2] = WALL_H
                rc++
            }
            else {
                if (mc[pfp + 1][psp] == WALL_EMPTY_SLOT && pfp % 2 == 0 && mc[pfp + 2][psp] != WALL_V) {
                    mc[pfp][psp] = WALL_V
                    mc[pfp + 1][psp] = WALL_V_MID_MARKER
                    mc[pfp + 2][psp] = WALL_V
                    rc++
                }
            }
            for (i = 0; i < 17; i++) {
                mcr[i] = new Array(17)
                for (s = 0; s < 17; s++) {
                    mcr[i][s] = mc[i][s]
                }
            }
            for (i = 0; i < 17; i++) {
                mcb[i] = new Array(17)
                for (s = 0; s < 17; s++) {
                    mcb[i][s] = mc[i][s]
                }
            }
            ssp = idsp % 18
            sfp = (Math.floor(idsp / 18)) * 2
            fsp = sidsp % 18
            ffp = (Math.floor(sidsp / 18)) * 2
            const ms = new wallchecka(mc)
            const msb = new wallcheckb(mcb)
            ms.traversea(ffp, fsp)
            msb.traverseb(sfp, ssp)

            if (wc == true && wcb == true && rc > 0) {
                for (i = 0; i < 17; i++) {
                    for (s = 0; s < 17; s++) {
                        arr[i][s] = mcr[i][s]
                    }
                }
                arrwf[walls] = ""
                walls--
                arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>"

                tor++
                arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
            }
            else {
                del.classList = "wce"
                del.innerHTML = "illegal move"
                del.style.display = "block"
                allow = 0
            }
            runComputerTurn(600)
            var text = "";
            for (i = 0; i < arrrows; i++) {
                for (s = 0; s < arr[i].length; s++) {
                    text += arr[i][s]
                }
                text += "</br> "
            }
            games.innerHTML = text
            text = "";
            for (i = 0; i < 10; i++) {
                text += arrwf[i]
            }
            document.getElementById("tilea").innerHTML = text
            text = "";
            for (i = 0; i < 10; i++) {
                text += arrwb[i]
            }
            document.getElementById("tileb").innerHTML = text
        }
        else {
            if (tor % 2 == 1 && wallsb > 0) {
                if (mc[pfp][psp + 1] != WALL_V_MID_MARKER && pfp % 2 == 1 && mc[pfp][psp + 2] != WALL_H && psp < 16) {
                    mc[pfp][psp] = WALL_H
                    mc[pfp][psp + 1] = WALL_H_MID_MARKER
                    mc[pfp][psp + 2] = WALL_H
                    rc++
                }
                else {
                    if (mc[pfp + 1][psp] == WALL_EMPTY_SLOT && pfp % 2 == 0 && mc[pfp + 2][psp] != WALL_V) {
                        mc[pfp][psp] = WALL_V
                        mc[pfp + 1][psp] = WALL_V_MID_MARKER
                        mc[pfp + 2][psp] = WALL_V

                        rc++
                    }
                }
                for (i = 0; i < 17; i++) {
                    mcr[i] = new Array(17)
                    for (s = 0; s < 17; s++) {
                        mcr[i][s] = mc[i][s]
                    }
                }
                for (i = 0; i < 17; i++) {
                    mcb[i] = new Array(17)
                    for (s = 0; s < 17; s++) {
                        mcb[i][s] = mc[i][s]
                    }
                }
                fsp = sidsp % 18
                ffp = (Math.floor(sidsp / 18)) * 2
                ssp = idsp % 18
                sfp = (Math.floor(idsp / 18)) * 2
                const ms = new wallchecka(mc)
                const msb = new wallcheckb(mcb)
                ms.traversea(ffp, fsp)
                msb.traverseb(sfp, ssp)
                if (wc == true && wcb == true && rc > 0) {
                    for (i = 0; i < 17; i++) {
                        for (s = 0; s < 17; s++) {
                            arr[i][s] = mcr[i][s]
                        }
                    }
                    arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>"
                    arrwb[wallsb] = ""
                    wallsb--
                    tor++
                    arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>"
                }
                else {
                    del.style.display = "block"
                    del.classList = "wce"
                    del.innerHTML = "illegal move"
                    del.style.display = "block"
                    allow = 0
                }
                var text = "";
                for (i = 0; i < arrrows; i++) {
                    for (s = 0; s < arr[i].length; s++) {
                        text += arr[i][s]
                    }
                    text += "</br> "
                }
                games.innerHTML = text
                text = "";
                for (i = 0; i < 10; i++) {
                    text += arrwf[i]
                }
                document.getElementById("tilea").innerHTML = text
                text = "";
                for (i = 0; i < 10; i++) {
                    text += arrwb[i]
                }
                document.getElementById("tileb").innerHTML = text
                runComputerTurn(600)   // needed when the computer is player 1 and I just placed player 2's wall
            }

        }
        for (i = 0; i < 17; i++) {
            mc[i] = new Array(17)
            for (s = 0; s < 17; s++) {
                mc[i][s] = arr[i][s]
            }
        }
    }
}

function BMM() {
    text = ""
    if (rules.classList == "bmm") {
        if (allow == 1) {
            del.style.display = "block"
            del.classList = "sbut"
            del.innerHTML = "start a game:"
            document.getElementById("resign").style.display = "none"
            scorea.style.display = "none"
            scoreb.style.display = "none"
            games.innerHTML = text
            games.style.display = "none"
            rules.classList = "rules"
            title.style.display = "block"
            shop.style.display = "block"
            pa.style.display = "none"
            pb.style.display = "none"
            pc.style.display = "none"
            pd.style.display = "none"
            pe.style.display = "none"
            pf.style.display = "none"
            settingsBtn.style.display = "block"
            title.innerHTML = "tAPY's qurridor, <br /> HAVE FUN!"
            rules.innerHTML = "rules for qurridor:"
            ff.style.display = "block"
            document.getElementById("tileb").innerHTML = text
            document.getElementById("tilea").innerHTML = text
        }
    }
    else {
        del.style.display = "none"
        games.classList = "rulest"
        games.style.display = "block"
        games.innerHTML = "<div id='game'> back to main menu <div />"
        ff.style.display = "none"
        del.innerHTML = "start a game:"
        settingsBtn.style.display = "none"
        settings.style.display = "none"
        rules.classList = "srules"
        rules.innerHTML = "PURPOSE OF THE GAME </br > To be the first to reach the line opposite to ones base line </br > RULES FOR 2 PLAYERS </br > Each player places his pawn in the centre of his base </br >How To Play The Game Quoridor </br >  Each player in turn, chooses to move his pawn or to put up one of his fences. When he has run out of fences, the player must move his pawn. </br > PAWN MOVES </br > The pawns are moved one square at a time, horizontally or vertically, forwards or The pawns must get around the fences </br > fences must be placed between 2 sets of 2 square. The fences can be used to facilitate the players progress or to impede that of the opponent,however, an acess to the goal line must always be left open </br >  When two pawns face each other on neighbouring squares which are not separated by a fence, the player whose turn it is can jump the opponents pawn(and place himself behind him), thus advancing an extra square </br > If there is a fence behind the said pawn, the player can place his pawn to the left or the right of the other pawn </br > END OF GAME </br > The first player who reaches one of the 9 squares opposite his base line is the winner </br > TIME OF GAME </br > From 10 to 20 minutes In a tournament, it possible to allocate a set time to each player"
        title.innerHTML = "rules:"
    }
    if (rules.classList == "srules") {
        ee++
        if (ee == 20) {
            games.classList = "win"
            games.style.display = "block"
            ee = 0
            games.innerHTML = "you found it! <br /> heres 1000 vso"
            vso += 1000
            vsod.innerHTML = "vso:" + vso
            if (unlock4 && unlock3 && unlock2 && unlock1) {
                skinss = 5
                hank = 1
            }
        }
    }
}
function BMM2() {
    if (games.classList != "game"  ) {
        pa.style.display = "none"
        pb.style.display = "none"
        pc.style.display = "none"
        pd.style.display = "none"
        pe.style.display = "none"
        pf.style.display = "none"
        shop.classList = "store"
        games.style.display = "none"
        rules.classList = "rules"
        title.innerHTML = "tAPY's qurridor, <br /> HAVE FUN!"
        rules.innerHTML = "rules for qurridor:"
        ff.style.display = "block"
        del.classList = "sbut"
        del.style.display = "block"
    }
}
function resignF() {
    if(allow == 1){
    resign.style.display = "none"
    del.classList = "win"
    del.style.display = "block"
    rules.style.display = "none"
    allow = 0
    if (tor % 2 == 0) {
        winb++
        del.innerHTML = "you lose! <br /> <br /> click for the main menu"
    }
    else {
        vso += 100
        wina++
        del.innerHTML = "you win! <br /> <br /> click for the main menu"
    }
    }
}
function store() {
    games.style.display = "none"
    title.innerHTML = "shop:"
    ff.style.display = "none"
    rules.innerHTML = ""
    rules.classList = "bmm"
    del.style.display = "none"
    shop.style.display = "none"
    pa.classList = "s1"
    pb.classList = "s2"
    pc.classList = "s3"
    pd.classList = "s4"
    pe.classList = "s5"
    pa.style.display = "block"
    pb.style.display = "block"
    pc.style.display = "block"
    pd.style.display = "block"
    pe.style.display = "block"
    settingsBtn.style.display = "none"
    settings.style.display = "none"
    if (hank == 1) {
        pf.classList = "s6"
        pf.style.display = "block"
    }
}
var sid = 0
function pawn(skin) {
    tor = 0
    skins = skin.id % 1000
    if (skins == 0) {
        pa.innerHTML = "<div class='eq'> equipped </div> "
        if (sid == 1)
            pb.innerHTML = ""
        if (sid == 2)
            pc.innerHTML = ""
        if (sid == 3)
            pd.innerHTML = ""
        if (sid == 4)
            pe.innerHTML = ""
        if (sid == 5)
            pf.innerHTML = ""
        skinss = 0
        sid = skin.id % 1000
    }
    if (skins == 1) {
        if (vso >= 1000 || unlock1) {
            if (unlock1) {
                vso += 1000
            }
            vso -= 1000
            vsod.innerHTML = "vso:" + vso
            skinss = 1
            unlock1 = true
            pb.innerHTML = "<div class='eq'> equipped </div> "
            pb.style.backgroundImage = "url(pawn.png)"
            if (sid == 0)
                pa.innerHTML = ""
            if (sid == 2)
                pc.innerHTML = ""
            if (sid == 3)
                pd.innerHTML = ""
            if (sid == 4)
                pe.innerHTML = ""
            if (sid == 5)
                pf.innerHTML = ""
            sid = skin.id % 1000
        }
    }
    if (skins == 2) {
        if (vso >= 1000 || unlock2) {
            if (unlock2) {
                vso += 1000
            }
            skinss = 2
            vso -= 1000
            vsod.innerHTML = "vso:" + vso
            unlock2 = true
            if (sid == 0)
                pa.innerHTML = ""
            if (sid == 1)
                pb.innerHTML = ""
            if (sid == 3)
                pd.innerHTML = ""
            if (sid == 4)
                pe.innerHTML = ""
            if (sid == 5)
                pf.innerHTML = ""
            pc.innerHTML = "<div class='eq'> equipped </div>"
            pc.style.backgroundImage = "url(pawna.png)"
            sid = skin.id % 1000
        }
    }
    if (skins == 3) {
        if (vso >= 1000 || unlock3) {
            if (unlock3) {
                vso += 1000
            }
            skinss = 3
            vso -= 1000
            vsod.innerHTML = "vso:" + vso
            unlock3 = true
            if (sid == 0)
                pa.innerHTML = ""
            if (sid == 1)
                pb.innerHTML = ""
            if (sid == 2)
                pc.innerHTML = ""
            if (sid == 4)
                pe.innerHTML = ""
            if (sid == 5)
                pf.innerHTML = ""
            pd.innerHTML = "<div class='eq'> equipped </div> "
            pd.style.backgroundImage = "url(player-pawngreen.jpeg)"
            sid = skin.id % 1000
        }
    }
    if (skins == 4) {
        if (vso >= 1000 || unlock4) {
            if (unlock4) {
                vso += 1000
            }
            skinss = 4
            vso -= 1000
            vsod.innerHTML = "vso:" + vso
            unlock4 = true
            pe.innerHTML = "<div class='eq'> equipped </div> "
            pe.style.backgroundImage = "url(playera-pawn.jpeg)"
            if (sid == 0)
                pa.innerHTML = ""
            if (sid == 1)
                pb.innerHTML = ""
            if (sid == 2)
                pc.innerHTML = ""
            if (sid == 3)
                pd.innerHTML = ""
            if (sid == 5)
                pf.innerHTML = ""
            sid = skin.id % 1000
        }
    }
    if (skins == 5) {
        if (vso >= 1000 || unlock5) {
            skinss = 5
            vsod.innerHTML = "vso:" + vso
            unlock5 = true
            pf.innerHTML = "<div class='eq'> equipped </div> "
            pf.style.backgroundImage = "url(eeskin.jepg.webp)"
            if (sid == 0)
                pa.innerHTML = ""
            if (sid == 1)
                pb.innerHTML = ""
            if (sid == 2)
                pc.innerHTML = ""
            if (sid == 3)
                pd.innerHTML = ""
            if (sid == 4)
                pe.innerHTML = ""
            sid = skin.id % 1000
        }
    }
    drawgame = 0
}

function wallchecka(maze) {
    wc = false
    this.maze = maze
    this.traversea = function (row, col) {
        this.maze[row][col] = 'v'

        if (row == 0) {
            wc = true
        }
        else {
            if (row > 0 && this.maze[row - 1][col] != WALL_H && this.maze[row - 2][col] != 'v')
                this.traversea(row - 2, col)
            if (col > 0 && this.maze[row][col - 1] != WALL_V && this.maze[row][col - 2] != 'v')
                this.traversea(row, col - 2)
            if (col < 16 && this.maze[row][col + 1] != WALL_V && this.maze[row][col + 2] != 'v')
                this.traversea(row, col + 2)
            if (row < 16 && this.maze[row + 1][col] != WALL_H && this.maze[row + 2][col] != 'v')
                this.traversea(row + 2, col)
        }
        if (wc != true)
            wc = false
    }
}
function wallcheckb(maze) {
    wcb = false
    this.maze = maze
    this.traverseb = function (row, col) {

        this.maze[row][col] = 'v'
        if (row == 16) {
            wcb = true
        }
        else {
            if (row < 16 && this.maze[row + 1][col] != WALL_H && this.maze[row + 2][col] != 'v')
                this.traverseb(row + 2, col)
            if (col < 16 && this.maze[row][col + 1] != WALL_V && this.maze[row][col + 2] != 'v')
                this.traverseb(row, col + 2)
            if (col > 0 && this.maze[row][col - 1] != WALL_V && this.maze[row][col - 2] != 'v')
                this.traverseb(row, col - 2)
            if (row > 0 && this.maze[row - 1][col] != WALL_H && this.maze[row - 2][col] != 'v')
                this.traverseb(row - 2, col)
        }
        if (wcb != true)
            wcb = false
    }
}
function BuildGame() {
    tor = 0
    idnum = 0
    idsp = 8
    sidsp = 152
    ti = 0
    walls = 9
    wallsb = 9
    arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": 9 </div>"
    for (i = 1; i < 10; i++) {
        arrwf[i] = "<button class='wallsa' style='width:100px;height:10px'> </button>"
        arrwf[i] += "</br> "
    }
    arrwb = new Array(1)
    arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": 9 </div>"
    for (i = 1; i < 10; i++) {
        arrwb[i] = "<button class='wallsb' style='width:100px;height:10px'> </button>"
        arrwb[i] += "</br> "
    }
    for (i = 0; i < arr.length; i++) {
        arr[i] = new Array(arrrows)
        for (s = 0; s < arr[i].length; s = s + 2) {
            if (i % 2 == 0) {
                if (i == 16 && s == 8) {
                    arr[i][s] = P1_TILE();
                    s = s + 2
                    idnum += 2
                }
                arr[i][s] = "<button id='" + idnum.toString() + "' onclick='move(this)'  class='player-tiles' style='width:56px;height:56px'> </button>";
                idnum += 2
            }
        }
    }
    idnum = 1;
    for (i = 0; i < arr.length; i = i + 2) {
        for (s = 1; s < arr[i].length; s = s + 2) {
            arr[i][s] = "<button id='" + idnum.toString() + "' onclick='wallf(this)' class='wall-tilesa' style='width:20px;height:56px'> </button>";
            idnum++
            idnum++
        }
        for (ti = 0; ti < 18; ti++) {
            idnum++
        }
    }
    idnum = 1
    for (i = 1; i < arr.length; i = i + 2) {
        for (ti = 0; ti < 16; ti++) {
            idnum++
        }
        for (s = 0; s < arr[i].length; s++) {
            if (s % 2 == 1) {
                arr[i][s] = WALL_EMPTY_SLOT;
            }
            else {
                arr[i][s] = "<button id='" + idnum.toString() + "' onclick='wallf(this)' class='wall-tilesb' style='width:56px;height:20px'> </button>";
                idnum++
                idnum++
            }
        }
    }
    arr[0][8] = P2_TILE();
    if (drawgame == 1) {
        var text = "";
        for (i = 0; i < arrrows; i++) {
            if (i % 2 == 0) {
                for (s = 0; s < arr[i].length; s++) {
                    text += arr[i][s]
                }
            }
            else {
                for (s = 0; s < arr[i].length; s++) {
                    text += arr[i][s]
                }
            }
            text += "</br> "
        }
        games.innerHTML = text
        text = "";
        for (i = 0; i < 10; i++) {
            text += arrwf[i]
        }
        document.getElementById("tilea").innerHTML = text
        text = "";
        for (i = 0; i < 10; i++) {
            text += arrwb[i]
        }
        document.getElementById("tileb").innerHTML = text

    }
}
function inBounds(r, c) {
    return r >= 0 && r <= 16 && c >= 0 && c <= 16;
}

// Which picture each pawn wears. Normally player 1 (bottom) wears MY skin and player 2 the default pawn.
// When I play second against the computer it is the other way round: my pawn is player 2.
// myPawnClass(): the picture of MY equipped skin.
function myPawnClass() { return "playeras" + (skinss + 1); }
// oppPawnClass(): the picture of the OTHER player's pawn.
//   vs computer / local 2 players: the default blue pawn.
//   online: the skin the opponent really has equipped (QO.oppSkin comes from the server).
//   If we both wear the same skin the opponent gets the default blue pawn so they can be told apart.
function oppPawnClass() {
    var o = (window.QO && QO.active) ? QO.oppSkin : -1;
    return (o >= 0 && o !== skinss) ? "playeras" + (o + 1) : "playerb";
}
function p1PawnClass() { return viewFlipped() ? oppPawnClass() : myPawnClass(); }
function p2PawnClass() { return viewFlipped() ? myPawnClass() : oppPawnClass(); }
function P1_TILE() {
    return "<button id='152' class='" + p1PawnClass() + "' style='width:56px;height:56px'> </button>";
}
function P2_TILE() {
    return "<button id='8' class='" + p2PawnClass() + "' style='width:56px;height:56px'> </button>";
}
// =====================================================================
//  THE COMPUTER OPPONENT - HOW IT WORKS (read this first)
// =====================================================================
//  The board is a 17 x 17 grid (the `grid` / `arr` array), rows 0 (top) to 16 (bottom):
//    - squares where pawns stand sit on EVEN rows and EVEN columns
//    - the thin gaps between squares (where walls go) sit on ODD rows / ODD columns
//        a gap in an ODD row  + EVEN column = between two squares above/below each other (a HORIZONTAL wall goes here)
//        a gap in an EVEN row + ODD column  = between two squares side by side         (a VERTICAL wall goes here)
//        a gap in an ODD row  + ODD column  = the crossing point (the wall's middle marker)
//    - a wall is 3 cells long: wall piece, middle marker, wall piece
//  Player 1 starts at the bottom (row 16) and must reach row 0.
//  Player 2 starts at the top (row 0)    and must reach row 16.
//  Every grid cell holds a piece of HTML text (a string). Two cells are "the same thing"
//  when their strings are equal (e.g. cell === WALL_H means "there is a horizontal wall piece").
//  That is also how a pawn is recognised: a cell holding the opponent's pawn HTML is "occupied".
//
//  The computer's turn, step by step:
//    runComputerTurn() waits a moment, then calls
//    computerMove()     which copies the real board and asks
//    minimax()          to imagine many moves ahead. minimax uses
//      generateMoves()  to list the legal moves (pawn moves + a few smart wall spots)
//      applyMove()      to play a move on a copy of the board
//      evaluatePositionGrid()  to give a score to the position at the end of the imagined line
//      findShortestPathGrid()  to measure how far each pawn still is from its goal
//    then computerMove() plays the best move found on the REAL board
//    (move() for a pawn, placeComputerWall() for a wall).
// =====================================================================
var iscomputerplaying = 1; // 1 = PvE (P2 is the computer), 0 = PvP
var mySide = 0;            // vs computer: 0 = I'm player 1, 1 = I'm player 2
// computerSide(): which player the computer controls (1 or 2).
// If I chose to play second, the computer is player 1; otherwise it is player 2.
function computerSide() { return mySide === 1 ? 1 : 2; }   // which player the computer is
var aiDepth = 3; // default difficulty, used by runComputerTurn instead of a hardcoded 3

// toggleSettings(): the gear button - show / hide the settings box (mode + difficulty).
function toggleSettings() {
    var panel = document.getElementById("settings");
    panel.style.display = (panel.style.display === "block") ? "none" : "block";
}

// setGameMode(mode): the settings radio buttons. 'pve' = vs computer, anything else = 2 players.
function setGameMode(mode) {
    iscomputerplaying = (mode === 'pve') ? 1 : 0;   // 1 when the player chose 'vs Computer'
    refreshNames();   // update the name labels (computer / username / player 2)
}

// setDifficulty(value): the difficulty list. The value is the search depth (2, 3 or 4).
function setDifficulty(value) {
    aiDepth = parseInt(value, 10);
}

// ===================== AI: grid-based helpers =====================

// cloneGrid(grid): make a separate copy of the board.
// The AI tries moves on copies so it never changes the real board while it is only thinking.
function cloneGrid(grid) {
    var copy = new Array(grid.length);   // the new, empty list of rows
    for (var i = 0; i < grid.length; i++) {
        copy[i] = grid[i].slice();   // slice() copies one row
    }
    return copy;
}

// isWallBetweenGrid(grid, r1,c1, r2,c2): is there a wall between two NEIGHBOURING squares?
// (r1,c1) and (r2,c2) are 2 apart, e.g. (4,6) and (4,8); the gap between them is the cell in the middle.
function isWallBetweenGrid(grid, r1, c1, r2, c2) {
    if (r1 === r2) {   // same row = the squares are side by side, so only a VERTICAL wall can separate them
        var wallCol = (c1 + c2) / 2;   // the column of the gap between them
        return grid[r1][wallCol] === WALL_V;   // true if that gap holds a vertical wall piece
    } else {
        var wallRow = (r1 + r2) / 2;   // different rows = one square is above the other, so only a HORIZONTAL wall can separate them
        return grid[wallRow][c1] === WALL_H;   // true if the gap between them holds a horizontal wall piece
    }
}

// findShortestPathGrid(grid, startRow, startCol, goalRow): how many steps does a pawn need to reach the goal row?
// Walls are respected, pawns are ignored. Returns Infinity if the walls completely block the way.
// It tries every route (depth-first) but gives up on any route that is already longer than the best one found.
function findShortestPathGrid(grid, startRow, startCol, goalRow) {
    var best = {};   // best['row,col'] = the fewest steps found so far to stand on that square
    var bestToGoal = Infinity;   // fewest steps found so far to reach the goal row (none yet)
    function explore(row, col, dist) {   // explore: 'I am on (row,col) after dist steps - where can I go from here?'
        var key = row + "," + col;   // a text name for this square, e.g. "4,6"
        if (best[key] !== undefined && best[key] <= dist) return;   // already reached this square at least as quickly -> no point continuing
        best[key] = dist;   // remember the quickest way found to this square
        if (row === goalRow) { if (dist < bestToGoal) bestToGoal = dist; return; }   // reached the goal row: remember it if it is the quickest so far
        if (dist >= bestToGoal) return;   // this route is already as long as the best one -> stop
        var dirs = [{ dr: -2, dc: 0 }, { dr: 2, dc: 0 }, { dr: 0, dc: -2 }, { dr: 0, dc: 2 }];   // the four directions (up, down, left, right); each step moves 2 cells = one square
        for (var i = 0; i < dirs.length; i++) {
            var nr = row + dirs[i].dr, nc = col + dirs[i].dc;   // the neighbouring square in this direction
            if (!inBounds(nr, nc)) continue;   // off the board -> skip
            if (isWallBetweenGrid(grid, row, col, nr, nc)) continue;   // a wall is in the way -> skip
            explore(nr, nc, dist + 1);   // walk to that square (one more step)
        }
    }
    explore(startRow, startCol, 0);   // start from the pawn's square with 0 steps taken
    return bestToGoal;
}

// Same as above but also returns the actual shortest route (array of [row,col]).
// findShortestPathWithRoute(...): same search as above, but ALSO remembers the route itself.
// Returns { dist: number of steps, path: [[row,col], [row,col], ...] from the start to the goal }.
// The AI uses the route to decide where a wall would hurt the opponent most.
function findShortestPathWithRoute(grid, startRow, startCol, goalRow) {
    var best = {};
    var bestToGoal = Infinity;
    var bestPath = null;   // the best route found so far (list of squares)
    function explore(row, col, dist, path) {   // same as before, but `path` is the list of squares walked so far
        var key = row + "," + col;
        if (best[key] !== undefined && best[key] <= dist) return;
        best[key] = dist;
        if (row === goalRow) {
            if (dist < bestToGoal) { bestToGoal = dist; bestPath = path.slice(); }   // new best: keep a COPY of the route
            return;
        }
        if (dist >= bestToGoal) return;
        var dirs = [{ dr: -2, dc: 0 }, { dr: 2, dc: 0 }, { dr: 0, dc: -2 }, { dr: 0, dc: 2 }];
        for (var i = 0; i < dirs.length; i++) {
            var nr = row + dirs[i].dr, nc = col + dirs[i].dc;
            if (!inBounds(nr, nc)) continue;
            if (isWallBetweenGrid(grid, row, col, nr, nc)) continue;
            path.push([nr, nc]);   // step onto the square (add it to the route)
            explore(nr, nc, dist + 1, path);   // continue the search from there
            path.pop();   // step back (remove it) so the next direction starts from the same route
        }
    }
    explore(startRow, startCol, 0, [[startRow, startCol]]);   // the route starts with the pawn's own square
    return { dist: bestToGoal, path: bestPath || [] };   // (empty route if the goal cannot be reached)
}

// tryAddWallCandidate(candidates, checked, grid, pfp, psp, orientation, ...):
// checks ONE possible wall and, if it is legal, adds it to the `candidates` list.
//   pfp = the row of the wall's first piece, psp = its column, orientation = 'h' (horizontal) or 'v' (vertical)
//   `checked` remembers which spots were already looked at so none is tested twice.
// A wall is legal when: it fits on the board, it does not overlap or cross another wall,
// and BOTH pawns can still reach their goal afterwards (walls may never fully block a pawn).
function tryAddWallCandidate(candidates, checked, grid, pfp, psp, orientation, p1row, p1col, p2row, p2col) {
    if (pfp < 0 || pfp > 16 || psp < 0 || psp > 16) return;   // outside the board
    var key = orientation + ':' + pfp + ':' + psp;   // a unique name for this wall spot
    if (checked[key]) return;   // already tested
    checked[key] = true;   // mark as tested

    var testGrid = cloneGrid(grid);   // try the wall on a copy of the board
    if (orientation === 'h') {   // ---- horizontal wall: occupies (pfp,psp) (pfp,psp+1) (pfp,psp+2) ----
        if (pfp % 2 !== 1 || psp % 2 !== 0 || psp > 14 || psp < 0) return;   // a horizontal wall must start in an odd row and an even column, and have room for 3 cells
        if (pfp < 0 || pfp > 16) return;
        if (grid[pfp][psp] == null || grid[pfp][psp + 1] == null || grid[pfp][psp + 2] == null) return;   // all three cells must exist on the board
        if (grid[pfp][psp] == WALL_H) return; // already a wall here   // already a wall here
        if (grid[pfp][psp + 1] == WALL_V_MID_MARKER) return; // crosses a vertical wall's midpoint   // crosses a vertical wall's middle -> not allowed
        if (grid[pfp][psp + 2] == WALL_H) return;   // would overlap the next wall piece
        testGrid[pfp][psp] = WALL_H;   // place the three pieces on the test board
        testGrid[pfp][psp + 1] = WALL_H_MID_MARKER;
        testGrid[pfp][psp + 2] = WALL_H;
    } else {
        if (pfp % 2 !== 0 || psp % 2 !== 1 || pfp > 14 || pfp < 0) return;   // ---- vertical wall: occupies (pfp,psp) (pfp+1,psp) (pfp+2,psp); it must start in an even row and an odd column, with room for 3 cells
        if (psp < 0 || psp > 16) return;
        if (grid[pfp][psp] == null || grid[pfp + 1] == null || grid[pfp + 1][psp] == null || grid[pfp + 2] == null || grid[pfp + 2][psp] == null) return;
        if (grid[pfp][psp] == WALL_V) return; // already a wall here   // already a wall here
        if (grid[pfp + 1][psp] != WALL_EMPTY_SLOT) return; // crosses a horizontal wall's midpoint (or already occupied)   // the middle must be free (otherwise it crosses a horizontal wall or overlaps)
        if (grid[pfp + 2][psp] == WALL_V) return;   // would overlap the next wall piece
        testGrid[pfp][psp] = WALL_V;   // place the three pieces on the test board
        testGrid[pfp + 1][psp] = WALL_V_MID_MARKER;
        testGrid[pfp + 2][psp] = WALL_V;
    }

    if (findShortestPathGrid(testGrid, p1row, p1col, 0) < Infinity &&   // the wall is only legal if player 1 can still reach row 0 ...
        findShortestPathGrid(testGrid, p2row, p2col, 16) < Infinity) {   // ... and player 2 can still reach row 16
        candidates.push({ orientation: orientation, pfp: pfp, psp: psp });   // legal -> add it to the list
    }
}

// Only generates walls that intersect P1's current shortest route — this is
// what lets the AI "see" the value of a good wall at low depth, since it's
// guaranteed to be considering the opponent's actual path, not random spots.
// (the existing note above explains the idea)
// evaluatePositionGrid(): gives a position a score from PLAYER 1's point of view.
//   positive = player 1 is doing better, negative = player 2 is doing better.
//   score = (how far player 2 still has to go) - (how far player 1 still has to go)
//           + 1.5 for every extra wall player 1 has over player 2
//           (+1.5 more when the search depth is odd - your tweak)
//   9999 / -9999 mean somebody has already won.
function evaluatePositionGrid(grid, p1row, p1col, p2row, p2col, wallsP1Left, wallsP2Left) {
    var p1Dist = findShortestPathGrid(grid, p1row, p1col, 0);   // player 1's distance to row 0
    var p2Dist = findShortestPathGrid(grid, p2row, p2col, 16);   // player 2's distance to row 16
    if (p1Dist === 0) return 9999;   // player 1 is on the goal row -> player 1 won
    if (p2Dist === 0) return -9999;   // player 2 is on the goal row -> player 2 won
    var score = p2Dist - p1Dist;   // being closer to the goal than the opponent is good
    score += (wallsP1Left - wallsP2Left) * 1.5;   // having more walls left than the opponent is good (each wall is worth 1.5)
    if(aiDepth % 2 == 1) score += 1.5   // odd search depths end on the other player's move, so this evens things out (your tweak)

    return score;
}

// toMove: 1 or 2. Generates every legal pawn move + nearby legal walls for that player.
// generateMoves(): the list of ALL legal moves for the player `toMove` (1 or 2).
// Each move is an object:
//   { type:'pawn', row, col }                       -> move the pawn to that square
//   { type:'wall', orientation:'h'|'v', pfp, psp }  -> put a wall there
// The checks look at the cells between squares (a wall piece there blocks the move) and compare
// the destination with the opponent's pawn cell (the opponent's pawn blocks a plain step).
function generateMoves(grid, toMove, p1row, p1col, p2row, p2col, wallsLeft) {
    var moves = [];   // the list we will return
    var myRow = toMove === 1 ? p1row : p2row;   // my pawn's position ...
    var myCol = toMove === 1 ? p1col : p2col;
    var oppRow = toMove === 1 ? p2row : p1row;   // ... and the opponent's position
    var oppCol = toMove === 1 ? p2col : p1col;

    if (myRow < 16 && grid[myRow + 1][myCol] != WALL_H && grid[myRow + 2][myCol] != grid[oppRow][oppCol]) {   // STEP DOWN: not on the last row, no wall below me, and the square below is not the opponent's pawn
        moves.push({ type: 'pawn', row: myRow + 2, col: myCol });
    }
    if (myCol < 16 && grid[myRow][myCol + 1] != WALL_V && grid[myRow][myCol + 2] != grid[oppRow][oppCol]) {   // STEP RIGHT (same checks)
        moves.push({ type: 'pawn', row: myRow, col: myCol + 2 });
    }
    if (myCol > 0 && grid[myRow][myCol - 1] != WALL_V && grid[myRow][myCol - 2] != grid[oppRow][oppCol]) {   // STEP LEFT (same checks)
        moves.push({ type: 'pawn', row: myRow, col: myCol - 2 });
    }
    if (myRow > 0 && grid[myRow - 1][myCol] != WALL_H && grid[myRow - 2][myCol] != grid[oppRow][oppCol]) {   // STEP UP (same checks)
        moves.push({ type: 'pawn', row: myRow - 2, col: myCol });
    }

    if (myCol < 14 && grid[myRow][myCol + 1] != WALL_V && grid[myRow][myCol + 3] != WALL_V && grid[myRow][myCol + 2] == grid[oppRow][oppCol]) {   // JUMP RIGHT over the opponent: they stand right next to me and there is no wall before or behind them (jump lands 2 squares away)
        moves.push({ type: 'pawn', row: myRow, col: myCol + 4 });
    }
    if (myCol > 2 && grid[myRow][myCol - 1] != WALL_V && grid[myRow][myCol - 3] != WALL_V && grid[myRow][myCol - 2] == grid[oppRow][oppCol]) {   // JUMP LEFT over the opponent
        moves.push({ type: 'pawn', row: myRow, col: myCol - 4 });
    }
    if (myRow < 14 && grid[myRow + 1][myCol] != WALL_H && grid[myRow + 3][myCol] != WALL_H && grid[myRow + 2][myCol] == grid[oppRow][oppCol]) {   // JUMP DOWN over the opponent
        moves.push({ type: 'pawn', row: myRow + 4, col: myCol });
    }
    if (myRow > 2 && grid[myRow - 1][myCol] != WALL_H && grid[myRow - 3][myCol] != WALL_H && grid[myRow - 2][myCol] == grid[oppRow][oppCol]) {   // JUMP UP over the opponent
        moves.push({ type: 'pawn', row: myRow - 4, col: myCol });
    }

    // DIAGONAL moves: allowed only when the opponent is right next to me AND the straight jump is blocked
    // (by a wall behind them or by the edge of the board). There are four: up-right, down-right, down-left, up-left.
    if (myRow > 0 && myCol < 16 &&
        ((grid[myRow - 1][myCol] != WALL_H && (myRow == 2 || grid[myRow - 3][myCol] == WALL_H) &&
            grid[myRow - 2][myCol + 1] != WALL_V && (grid[myRow - 2][myCol] == grid[oppRow][oppCol])) ||
            (grid[myRow][myCol + 1] != WALL_V && (myCol == 14 || grid[myRow][myCol + 3] == WALL_V) &&
                grid[myRow - 1][myCol + 2] != WALL_H && (grid[myRow][myCol + 2] == grid[oppRow][oppCol])))) {
        moves.push({ type: 'pawn', row: myRow - 2, col: myCol + 2 });   // up-right
    }
    if (myRow < 16 && myCol < 16 &&
        ((grid[myRow + 1][myCol] != WALL_H && (myRow == 14 || grid[myRow + 3][myCol] == WALL_H) &&
            grid[myRow + 2][myCol + 1] != WALL_V && (grid[myRow + 2][myCol] == grid[oppRow][oppCol])) ||
            (grid[myRow][myCol + 1] != WALL_V && (myCol == 14 || grid[myRow][myCol + 3] == WALL_V) &&
                grid[myRow + 1][myCol + 2] != WALL_H && (grid[myRow][myCol + 2] == grid[oppRow][oppCol])))) {
        moves.push({ type: 'pawn', row: myRow + 2, col: myCol + 2 });   // down-right
    }
    if (myRow < 16 && myCol > 0 &&
        ((grid[myRow + 1][myCol] != WALL_H && (myRow == 14 || grid[myRow + 3][myCol] == WALL_H) &&
            grid[myRow + 2][myCol - 1] != WALL_V && (grid[myRow + 2][myCol] == grid[oppRow][oppCol])) ||
            (grid[myRow][myCol - 1] != WALL_V && (myCol == 2 || grid[myRow][myCol - 3] == WALL_V) &&
                grid[myRow + 1][myCol - 2] != WALL_H && (grid[myRow][myCol - 2] == grid[oppRow][oppCol])))) {
        moves.push({ type: 'pawn', row: myRow + 2, col: myCol - 2 });   // down-left
    }
    if (myRow > 0 && myCol > 0 &&
        ((grid[myRow - 1][myCol] != WALL_H && (myRow == 2 || grid[myRow - 3][myCol] == WALL_H) &&
            grid[myRow - 2][myCol - 1] != WALL_V && (grid[myRow - 2][myCol] == grid[oppRow][oppCol])) ||
            (grid[myRow][myCol - 1] != WALL_V && (myCol == 2 || grid[myRow][myCol - 3] == WALL_V) &&
                grid[myRow - 1][myCol - 2] != WALL_H && (grid[myRow][myCol - 2] == grid[oppRow][oppCol])))) {
        moves.push({ type: 'pawn', row: myRow - 2, col: myCol - 2 });   // up-left
    }

    if (wallsLeft > 0) {   // WALLS: only if this player still has walls to place
        var targetRow = toMove === 1 ? p2row : p1row;   // I place walls against the OPPONENT's route: where is the opponent ...
        var targetCol = toMove === 1 ? p2col : p1col;
        var targetGoal = toMove === 1 ? 16 : 0;   // ... and which row are they heading to
        var wallCandidates = getLegalWallCandidatesGeneric(grid, p1row, p1col, p2row, p2col, targetRow, targetCol, targetGoal);   // the legal walls that block the opponent's shortest route
        for (var w = 0; w < wallCandidates.length; w++) {
            moves.push({ type: 'wall', orientation: wallCandidates[w].orientation, pfp: wallCandidates[w].pfp, psp: wallCandidates[w].psp });   // add each one to the move list
        }
    }

    return moves;
}

// Generic version of getLegalWallCandidates: targets whichever player's path is passed in.
// (the existing note above says it) getLegalWallCandidatesGeneric(): the legal walls worth trying against ONE player's shortest route.
// It walks along that route and, for every step, proposes the walls that would cut that step
// (using tryAddWallCandidate to throw away illegal ones). At most 8 are kept to keep the computer fast.
// targetRow/targetCol = the pawn we want to slow down, targetGoal = the row that pawn is heading to.
function getLegalWallCandidatesGeneric(grid, p1row, p1col, p2row, p2col, targetRow, targetCol, targetGoal) {
    var candidates = [];   // the legal walls found
    var checked = {};   // spots already tested
    var route = findShortestPathWithRoute(grid, targetRow, targetCol, targetGoal).path;   // the shortest route of the pawn we want to block

    for (var i = 0; i < route.length - 1; i++) {   // look at every step of that route
        var r1 = route[i][0], c1 = route[i][1];   // this step goes from (r1,c1) ...
        var r2 = route[i + 1][0], c2 = route[i + 1][1];   // ... to (r2,c2)

        if (r1 === r2) {
            var wallCol = Math.min(c1, c2) + 1;   // sideways step: the gap column between the two squares
            var rowBase = r1;   // 
            tryAddWallCandidate(candidates, checked, grid, rowBase - 2, wallCol, 'v', p1row, p1col, p2row, p2col);   // a vertical wall that cuts the step, starting 2 rows up
            tryAddWallCandidate(candidates, checked, grid, rowBase, wallCol, 'v', p1row, p1col, p2row, p2col);   // a vertical wall that cuts the step, starting on the same row
        } else {
            var wallRow = Math.min(r1, r2) + 1;   // up/down step: the gap row between the two squares
            var colBase = c1;   // 
            tryAddWallCandidate(candidates, checked, grid, wallRow, colBase - 2, 'h', p1row, p1col, p2row, p2col);   // a horizontal wall that cuts the step, starting 2 columns to the left
            tryAddWallCandidate(candidates, checked, grid, wallRow, colBase, 'h', p1row, p1col, p2row, p2col);   // a horizontal wall that cuts the step, starting on the same column
        }
    }

    if (candidates.length > 8) candidates = candidates.slice(0, 8);   // keep at most 8 walls
    return candidates;   // the list of legal walls
}

// applyMove(): plays ONE move in the imagination of the AI and returns the new position
// { grid, p1row, p1col, p2row, p2col }. A pawn move just changes that pawn's row/column (the grid is
// reused, because it does not change). A wall move builds a COPY of the grid with the 3 wall pieces added.
function applyMove(grid, move, toMove, p1row, p1col, p2row, p2col) {
    var newGrid = grid;   // start with the same grid (a pawn move does not change it)
    var newP1row = p1row, newP1col = p1col, newP2row = p2row, newP2col = p2col;   // start with the same pawn positions

    if (move.type === 'pawn') {   // pawn move: only the mover's position changes
        if (toMove === 1) { newP1row = move.row; newP1col = move.col; }   // player 1 moves
        else { newP2row = move.row; newP2col = move.col; }   // player 2 moves
    } else {
        newGrid = cloneGrid(grid);   // wall move: copy the grid so the original stays untouched
        if (move.orientation === 'h') {
            newGrid[move.pfp][move.psp] = WALL_H;   // horizontal wall: 3 pieces side by side (piece, middle marker, piece)
            newGrid[move.pfp][move.psp + 1] = WALL_H_MID_MARKER;
            newGrid[move.pfp][move.psp + 2] = WALL_H;
        } else {
            newGrid[move.pfp][move.psp] = WALL_V;   // vertical wall: 3 pieces one below the other (piece, middle marker, piece)
            newGrid[move.pfp + 1][move.psp] = WALL_V_MID_MARKER;
            newGrid[move.pfp + 2][move.psp] = WALL_V;
        }
    }
    return { grid: newGrid, p1row: newP1row, p1col: newP1col, p2row: newP2row, p2col: newP2col };   // the new position
}

// Bonus for a pawn move that follows a shortest path to the goal (0.5 in the mover's favour).
var SHORTEST_PATH_BONUS = 1.5;

// True if this is a pawn move that walks along a shortest path: the squares it gains on the goal
// equal the squares it travels (1 for a step, 2 for a jump over the other pawn or a diagonal).
// myDist = the mover's current shortest distance to the goal (minimax already has it).
function isShortestPathMove(grid, m, toMove, myDist, myRow, myCol) {
    if (m.type !== 'pawn' || !isFinite(myDist)) return false;   // walls never count, and neither does a position with no path
    var goalRow = toMove === 1 ? 0 : 16;   // the row this player is heading to
    var squaresTravelled = (Math.abs(m.row - myRow) + Math.abs(m.col - myCol)) / 2;   // how many squares this move covers (a normal step = 1, a jump or diagonal = 2)
    return findShortestPathGrid(grid, m.row, m.col, goalRow) === myDist - squaresTravelled;   // true when the distance left after the move equals the old distance minus the squares walked (= no detour)
}

// Cheap depth-0 guess used to order moves before the real recursive search,
// so alpha-beta prunes more branches (strong moves get tried first).
function orderMoves(moves, grid, toMove, p1row, p1col, p2row, p2col, wallsP1Left, wallsP2Left) {
    var scored = moves.map(function (m) {   // give every move a quick 'guess' score
        var next = applyMove(grid, m, toMove, p1row, p1col, p2row, p2col);   // play the move (on a copy)
        var nextWallsP1 = (toMove === 1 && m.type === 'wall') ? wallsP1Left - 1 : wallsP1Left;   // a wall uses up one of the player's walls
        var nextWallsP2 = (toMove === 2 && m.type === 'wall') ? wallsP2Left - 1 : wallsP2Left;
        var guess = evaluatePositionGrid(next.grid, next.p1row, next.p1col, next.p2row, next.p2col, nextWallsP1, nextWallsP2);   // score the position right after the move (no deeper thinking)
        return { move: m, guess: guess };   // remember the move together with its guess
    });
    if (toMove === 1) {   // player 1 wants HIGH scores -> best guess first
        scored.sort(function (a, b) { return b.guess - a.guess; });   // highest guess first
    } else {
        scored.sort(function (a, b) { return a.guess - b.guess; });   // player 2 wants LOW scores -> lowest guess first
    }
    return scored.map(function (s) { return s.move; });   // give back just the moves, in the new order
}

// =====================================================================
// minimax(...)  -  the computer's "brain".
//
// WHAT IT DOES (in plain words):
//   The computer wants to pick the best move. To judge a move it imagines
//   what happens next: "if I do this, the opponent will answer with their best
//   move, then I answer with my best move, ..." - looking `depth` moves ahead.
//   At the end of that imagined game it scores the position with a number.
//
// THE SCORE (always from PLAYER 1's point of view):
//   big positive number  = good for player 1
//   big negative number  = good for player 2
//   so player 1 is the "MAX" player (wants the highest score)
//   and player 2 is the "MIN" player (wants the lowest score).
//
// PARAMETERS:
//   grid                 the 17x17 board (pawns, walls, empty slots)
//   p1row,p1col          where player 1's pawn stands
//   p2row,p2col          where player 2's pawn stands
//   wallsP1Left/P2Left   how many walls each player still has
//   depth                how many more moves to imagine (0 = stop and score the position)
//   alpha, beta          the "alpha-beta pruning" numbers (explained below)
//   toMove               whose turn it is in the imagined game: 1 or 2
//
// RETURNS: { score: the number for the best line found,
//            move:  the best first move for the player to move (null at the end of the search) }
//
// ALPHA-BETA PRUNING (a speed-up that does NOT change the answer):
//   alpha = the best score player 1 is already sure to get elsewhere
//   beta  = the best score player 2 is already sure to get elsewhere
//   If alpha >= beta, the opponent would never let the game reach this branch,
//   so the rest of the moves here are skipped ("pruned").
// =====================================================================
function minimax(grid, p1row, p1col, p2row, p2col, wallsP1Left, wallsP2Left, depth, alpha, beta, toMove) {
    // How many squares each pawn still needs to reach its goal row, going around walls.
    // (player 1 walks UP to row 0, player 2 walks DOWN to row 16)
    var p1Dist = findShortestPathGrid(grid, p1row, p1col, 0);
    var p2Dist = findShortestPathGrid(grid, p2row, p2col, 16);

    // STOP 1: somebody already won in this imagined game.
    // "+ depth" makes a FASTER win score higher (more depth left = won sooner),
    // so the computer prefers to win quickly and to lose as late as possible.
    if (p1Dist === 0) return { score: 9999 + depth, move: null };
    if (p2Dist === 0) return { score: -9999 - depth, move: null };

    // STOP 2: we imagined far enough -> just judge the position with a number
    // (compares the shortest paths, walls left, etc. inside evaluatePositionGrid).
    if (depth === 0) {
        return { score: evaluatePositionGrid(grid, p1row, p1col, p2row, p2col, wallsP1Left, wallsP2Left), move: null };
    }

    // Make a list of every legal move for the player whose turn it is
    // (pawn steps/jumps and wall placements; wall moves only if walls are left).
    var myWallsLeft = toMove === 1 ? wallsP1Left : wallsP2Left;
    var moves = generateMoves(grid, toMove, p1row, p1col, p2row, p2col, myWallsLeft);
    // Sort the list so the most promising moves are tried FIRST - good moves early
    // means alpha-beta can cut off more of the bad ones later.
    moves = orderMoves(moves, grid, toMove, p1row, p1col, p2row, p2col, wallsP1Left, wallsP2Left);
    // Start by assuming the first (most promising) move is the best.
    var bestMove = moves.length > 0 ? moves[0] : null;

    // ---------------- PLAYER 1's turn: MAX (looks for the HIGHEST score) ----------------
    if (toMove === 1) {
        var best = -Infinity;                                   // best score found so far (start as bad as possible)
        for (var i = 0; i < moves.length; i++) {                // try every move
            var m = moves[i];
            // make the move on a COPY of the board (the real board is never touched)
            var next = applyMove(grid, m, 1, p1row, p1col, p2row, p2col);
            // a wall costs player 1 one wall from their stock
            var nextWallsP1 = m.type === 'wall' ? wallsP1Left - 1 : wallsP1Left;
            // now imagine player 2's best answer (depth - 1, and it's player 2's turn)
            var result = minimax(next.grid, next.p1row, next.p1col, next.p2row, next.p2col, nextWallsP1, wallsP2Left, depth - 1, alpha, beta, 2);
            var score = result.score;
            // player 1 likes high scores, so a shortest-path move gets +1.5
            if (isShortestPathMove(grid, m, 1, p1Dist, p1row, p1col)) score += SHORTEST_PATH_BONUS;
            // keep this move if it scores higher than the best so far, OR if it ties and
            // it is a pawn move that ends closer to the goal than the current best pawn move
            if (score >= best ) {
                best = score; bestMove = m;
            }
            if (best > alpha) alpha = best;                     // player 1 can now guarantee at least `best`
            if (alpha >= beta) break;                           // PRUNE: player 2 would never allow this line, stop looking
        }
        return { score: best, move: bestMove };
    }
    // ---------------- PLAYER 2's turn: MIN (looks for the LOWEST score) ----------------
    else {
        var best2 = Infinity;                                   // best (lowest) score so far (start as bad as possible for player 2)
        for (var j = 0; j < moves.length; j++) {                // try every move
            var m2 = moves[j];
            var next2 = applyMove(grid, m2, 2, p1row, p1col, p2row, p2col);   // move on a copy of the board
            var nextWallsP2 = m2.type === 'wall' ? wallsP2Left - 1 : wallsP2Left;   // a wall costs player 2 one wall
            // imagine player 1's best answer (depth - 1, player 1's turn)
            var result2 = minimax(next2.grid, next2.p1row, next2.p1col, next2.p2row, next2.p2col, wallsP1Left, nextWallsP2, depth - 1, alpha, beta, 1);
            var score2 = result2.score;
            // scores are from player 1's point of view and player 2 likes LOW scores,
            // so a shortest-path move for player 2 gets -1 (that is +0.5 in its favour)
            if (isShortestPathMove(grid, m2, 2, p2Dist, p2row, p2col)) score2 -= SHORTEST_PATH_BONUS;
            // keep this move if it scores LOWER than the best so far, or on a tie if it is
            // a pawn move that ends closer to player 2's goal (row 16)
            if (score2 <= best2 ){
                best2 = score2; bestMove = m2;
            }
            if (best2 < beta) beta = best2;                     // player 2 can now guarantee at most `best2`
            if (alpha >= beta) break;                           // PRUNE: player 1 would never allow this line, stop looking
        }
        return { score: best2, move: bestMove };
    }
}

// ===================== AI: execution on the real board =====================

// placeComputerWall(orientation, pfp, psp): puts the wall the AI chose on the REAL board.
// (Humans place walls with wallf() when they click; this does the same job for the computer.)
// It re-checks that the wall is legal, updates the board / wall stack / turn counter and the name labels.
function placeComputerWall(orientation, pfp, psp) {
    for (i = 0; i < 17; i++) {
        mc[i] = new Array(17);
        for (s = 0; s < 17; s++) {
            mc[i][s] = arr[i][s];
        }
    }

    var rc = 0;   // rc = 1 once the wall has been drawn on the working copy
    if (orientation === 'h') {   // horizontal wall: pieces at psp, psp+1 (middle marker), psp+2 on row pfp
        if (mc[pfp][psp + 1] != WALL_V_MID_MARKER && mc[pfp][psp + 2] != WALL_H) {   // not crossing a vertical wall and not overlapping another horizontal one
            mc[pfp][psp] = WALL_H;
            mc[pfp][psp + 1] = WALL_H_MID_MARKER;
            mc[pfp][psp + 2] = WALL_H;
            rc++;
        }
    } else {
        if (mc[pfp + 1][psp] == WALL_EMPTY_SLOT && mc[pfp + 2][psp] != WALL_V) {   // vertical wall: the middle slot must be free and the last piece must not overlap
            mc[pfp][psp] = WALL_V;
            mc[pfp + 1][psp] = WALL_V_MID_MARKER;
            mc[pfp + 2][psp] = WALL_V;
            rc++;
        }
    }

    for (i = 0; i < 17; i++) {
        mcr[i] = new Array(17);   // mcr = a copy to keep if the wall turns out legal
        for (s = 0; s < 17; s++) { mcr[i][s] = mc[i][s]; }
    }
    for (i = 0; i < 17; i++) {
        mcb[i] = new Array(17);   // mcb = a copy used by the 'can player 2 still reach its goal' check
        for (s = 0; s < 17; s++) { mcb[i][s] = mc[i][s]; }
    }

    var ssp = idsp % 18;   // convert the pawn ids into the old (18 per row) coordinates used by the path-checkers below
    var sfp = Math.floor(idsp / 18) * 2;
    var fsp = sidsp % 18;
    var ffp = Math.floor(sidsp / 18) * 2;
    const ms = new wallchecka(mc);   // path checker for player 1
    const msb = new wallcheckb(mcb);   // path checker for player 2
    ms.traversea(ffp, fsp);
    msb.traverseb(sfp, ssp);

    if (wc == true && wcb == true && rc > 0) {   // both pawns can still reach their goal, and the wall was drawn -> accept it
        for (i = 0; i < 17; i++) {
            for (s = 0; s < 17; s++) { arr[i][s] = mcr[i][s]; }
        }
        if (tor % 2 == 0) {   // computer is player 1: it used one of ITS walls
            arrwf[walls] = "";
            walls--;
            tor++;   // the turn passes to the other player
            arrwf[0] = "<div class='texta' style='opacity:30%'> " + p1Name() + ": " + (walls).toString() + " </div>";
            arrwb[0] = "<div class='textb' style='opacity:100%'> " + p2Name() + ": " + (wallsb).toString() + " </div>";
        } else {              // computer is player 2 (as before)
            arrwf[0] = "<div class='texta' style='opacity:100%'> " + p1Name() + ": " + (walls).toString() + " </div>";
            arrwb[wallsb] = "";
            wallsb--;
            tor++;
            arrwb[0] = "<div class='textb' style='opacity:30%'> " + p2Name() + ": " + (wallsb).toString() + " </div>";
        }
    } else {
        console.warn("placeComputerWall: chosen wall was illegal on the real board, skipping");   // safety net: the AI should never get here
        return;
    }

    for (i = 0; i < 17; i++) {
        mc[i] = new Array(17);
        for (s = 0; s < 17; s++) { mc[i][s] = arr[i][s]; }
    }
}

// computerMove(depth): the computer's whole decision for one turn.
//  1. do nothing if it is not the computer's turn
//  2. copy the real board and read both pawn positions (the pawn ids hold the position)
//  3. ask minimax() for the best move, looking `depth` moves ahead
//  4. play it: a wall with placeComputerWall(), a pawn step with move()
function computerMove(depth) {
    if (tor % 2 != computerSide() - 1) return;   // tor even = player 1's turn, odd = player 2's turn

    for (i = 0; i < 17; i++) {
        mc[i] = new Array(17);
        for (s = 0; s < 17; s++) { mc[i][s] = arr[i][s]; }
    }

    var P1row = Math.floor(sidsp / 18) * 2;   // turn the pawn ids into grid rows / columns (18 ids per row of squares, 2 grid rows per square row)
    var P1col = sidsp % 18;
    var P2row = Math.floor(idsp / 18) * 2;
    var P2col = idsp % 18;

    var result = minimax(mc, P1row, P1col, P2row, P2col, walls, wallsb, depth || 2, -Infinity, Infinity, computerSide());   // think! -infinity / infinity = no limits at the start of the search
    var decision = result.move;   // the best move found

    console.log("AI move:", decision, "score:", result.score);   // (for debugging: open the browser console to see what the AI chose)

    if (!decision) { console.warn("computerMove: no legal move found"); return; }   // no legal move at all (should not happen)

    window._lastP2pos = { row: P2row, col: P2col };   // remember where player 2 stood before this move

    if (decision.type === 'wall') {   // the AI chose a wall
        placeComputerWall(decision.orientation, decision.pfp, decision.psp);
        return;
    }

    var targetId = 9 * decision.row + decision.col;   // pawn move: convert grid row/column back into the square's id (9 per grid row)
    move({ id: targetId });   // play it like a click on that square
}

// runComputerTurn(delay): starts the computer's turn after a short pause (default 0.6 s) so
// the player can see what happened. Call it whenever the turn may have passed to the computer.
// `allow` = 0 blocks the player's clicks while the computer is 'thinking'.
function runComputerTurn(delay) {
    if (!iscomputerplaying) return;   // two-player mode: nothing to do
    if (tor % 2 != computerSide() - 1) return;   // not the computer's turn
    if (allow === 0 && (del.style.display == "block")) return;   // the game is over (the result box is showing)

    allow = 0;

    setTimeout(function () {   // wait `delay` ms, then play
        if (del.style.display == "block") return;   // the game ended while we waited (or the menu is showing) -> do not move

        allow = 1;
        computerMove(aiDepth);   // decide and play the move (aiDepth = the difficulty)

        if (del.style.display == "none") {
            allow = 1;
        }

        var text = "";
        for (i = 0; i < arrrows; i++) {
            for (s = 0; s < arr[i].length; s++) {
                text += arr[i][s];
            }
            text += "</br> ";
        }
        games.innerHTML = text;   // redraw the board from the grid ...

        text = "";
        for (i = 0; i < 10; i++) { text += arrwf[i]; }
        document.getElementById("tilea").innerHTML = text;   // ... and the wall stacks / name labels

        text = "";
        for (i = 0; i < 10; i++) { text += arrwb[i]; }
        document.getElementById("tileb").innerHTML = text;

    }, delay || 600);
}

// ===================== player names shown above the board =====================
var qurridorUser = ""; // set by auth.js after login
function shortName(n) { return n.length > 10 ? n.slice(0, 9) + "\u2026" : n; }
var onlineNames = null; // [host, guest] while playing online (set by online.js)
function p1Name() {
    if (onlineNames) return shortName(onlineNames[0]);
    if (iscomputerplaying && mySide === 1) return "computer";
    return qurridorUser ? shortName(qurridorUser) : "player1";
}
function p2Name() {
    if (onlineNames) return shortName(onlineNames[1]);
    if (iscomputerplaying) return mySide === 1 ? (qurridorUser ? shortName(qurridorUser) : "you") : "computer";
    return "player2";
}
function nameLabel(html, name) {
    return html.replace(/(<div[^>]*>\s*)[^:<]*(:)/, function (m, a, b) { return a + name + b; });
}
// rewrite the labels that are already built (used after login and when the mode changes)
function refreshNames() {
    if (arrwf[0]) arrwf[0] = nameLabel(arrwf[0], p1Name());
    if (arrwb[0]) arrwb[0] = nameLabel(arrwb[0], p2Name());
    var ta = document.getElementById("tilea"), tb = document.getElementById("tileb"), text, k;
    if (ta && ta.innerHTML) { text = ""; for (k = 0; k < 10; k++) { text += arrwf[k]; } ta.innerHTML = text; }
    if (tb && tb.innerHTML) { text = ""; for (k = 0; k < 10; k++) { text += arrwb[k]; } tb.innerHTML = text; }
}
refreshNames();

// ===================== start confirmation popup =====================
var startCss = document.createElement("style");
startCss.textContent =
    "#qs-overlay{position:fixed;inset:0;z-index:9997;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;font-family:Verdana,sans-serif}" +
    "#qs-box{background:#14532d;color:#fff;border-radius:20px;box-shadow:12px 8px 2px #000;padding:28px 32px;width:300px;text-align:center}" +
    "#qs-box h2{margin:0 0 18px;color:#ff0}" +
    "#qs-box button{margin:8px 4px 0;padding:10px 22px;border-radius:10px;border:none;font-size:16px;cursor:pointer;background:#fff;color:#14532d}" +
    "#qs-side{margin-bottom:12px}" +
    "#qs-side button{padding:8px 12px;font-size:14px}" +
    "#qs-box button.qs-sel{background:#ff0}";
document.head.appendChild(startCss);

var startOverlay = document.createElement("div");
startOverlay.id = "qs-overlay";
startOverlay.innerHTML =
    "<div id='qs-box'><h2>Start a game?</h2>" +
    "<div id='qs-side'>Play as:<br>" +
    "<button id='qs-p1' class='qs-sel'>Player 1 (first)</button>" +
    "<button id='qs-p2'>Player 2 (second)</button></div>" +
    "<button id='qs-yes'>Yes, start</button><button id='qs-no'>No</button></div>";
document.body.appendChild(startOverlay);

var chosenSide = 0;
function pickSide(s) {
    chosenSide = s;
    document.getElementById("qs-p1").className = s === 0 ? "qs-sel" : "";
    document.getElementById("qs-p2").className = s === 1 ? "qs-sel" : "";
}
document.getElementById("qs-p1").onclick = function () { pickSide(0); };
document.getElementById("qs-p2").onclick = function () { pickSide(1); };

function closeStartPopup() { startOverlay.style.display = "none"; }

document.getElementById("qs-yes").onclick = function () {
    mySide = iscomputerplaying ? chosenSide : 0;
    BuildGame();             // fresh board built AFTER the side is known, so the skins and the start squares are right
    refreshNames();          // put the right names on the score labels
    closeStartPopup();
    game();
};
document.getElementById("qs-no").onclick = closeStartPopup;
startOverlay.onclick = function (e) { if (e.target === startOverlay) closeStartPopup(); };
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeStartPopup();
});

// The start button calls this instead of game().
// Only the real "start a game" button asks; the result box
// ("click for the main menu" / "click to leave" / "illegal move") works as before.
// The text the start button shows in the main menu (read once, when the page loads).
var MENU_BUTTON_TEXT = del.innerHTML;

// goMainMenu(): leave the board and show the main menu again (title, start, shop, rules).
// It is what the "you win / you lost" box does when you click it.
function goMainMenu() {
    flipBoard(false);                       // the next game starts un-flipped (askStart / game() flips again if needed)
    BuildGame();                            // fresh board, walls and turn counter for the next game
    allow = 1;                              // the next game accepts clicks again
    games.style.display = "none";           // hide the board
    games.classList = "uwin";               // (not "game" any more, so a click on the board area is harmless)
    scorea.style.display = "none";          // hide the score boxes
    scoreb.style.display = "none";
    document.getElementById("tilea").style.display = "none";   // hide the player name / wall stacks
    document.getElementById("tileb").style.display = "none";
    resign.style.display = "none";          // hide the resign button
    title.style.display = "block";          // show the title, shop, picture and settings again
    title.innerHTML = "tAPY's qurridor, <br /> HAVE FUN!";
    shop.style.display = "block";
    shop.classList = "store";
    ff.style.display = "block";
    settingsBtn.style.display = "block";
    rules.classList = "rules";              // the rules button is back to its menu look
    rules.innerHTML = "rules for qurridor:";
    rules.style.display = "block";
    del.classList = "sbut";                 // the big green "start a game" button
    del.innerHTML = MENU_BUTTON_TEXT;
    del.style.display = "block";
}

// askStart(): the big button in the middle of the screen. It does 3 different things:
//   - menu ("sbut")      -> open the "start now?" popup
//   - result box ("win") -> go to the main menu (online: leave the room first)
//   - anything else      -> carry on with the normal game() (e.g. close the "illegal move" box)
function askStart() {
    if (del.classList == "sbut") {
        // the side choice only makes sense against the computer
        document.getElementById("qs-side").style.display = iscomputerplaying ? "block" : "none";
        pickSide(mySide);
        startOverlay.style.display = "flex";
    } else if (del.classList == "win") {
        if (window.QO && QO.active) { if (QO.leave) QO.leave(); }   // online: tell the server I left, then the page reloads to the menu
        else goMainMenu();
    } else {
        game();
    }
}

// ===================== playing as player 2 against the computer =====================
// True while I'm player 2 in a game against the computer (not online).
function iPlayP2() { return iscomputerplaying == 1 && mySide === 1 && !(window.QO && QO.active); }

// viewFlipped(): true when MY pawn is engine player 2, so the board is shown upside down
// and my pawn is at the bottom of the screen. That is the case when
//   - I play second against the computer, or
//   - I am the guest (player 2) in an online match.
// (iPlayP2 above is only for the computer game: it also swaps the win message / coins,
//  online.js already does that by itself for the guest.)
function viewFlipped() {
    if (window.QO && QO.active) return QO.side === 1;
    return iscomputerplaying == 1 && mySide === 1;
}

// The engine always treats player 1 as "you", so when I'm player 2 the result
// message and coins have to be flipped.
var _moveBase = move;
move = function (p) {
    if (!iPlayP2()) return _moveBase(p);
    var a = wina, b = winb;
    _moveBase(p);
    if (wina === a && winb === b) return;      // game not over
    if (winb > b) {                            // I (player 2) won
        del.innerHTML = "you win! <br /> <br /> click for the main menu";
        vso += 100;
    } else {                                   // the computer (player 1) won
        del.innerHTML = "you lost! <br /> <br /> click for the main menu";
        vso -= 100;                            // the engine gave it my coins, take them back
    }
    vsod.innerHTML = "vso:" + vso;
};

// The board is rotated 180 degrees when I play second, so the engine's "grow to the
// right / grow downward" looks like "grow left / grow up" on screen.
// Shift the anchor so the wall grows the way it looks: the clicked slot is the
// visual start of the wall, like when playing first.
var _wallfBase = wallf;

// mirrorWallId(id): the id of the slot the engine must use so the wall grows the way it
// LOOKS on the flipped board. Returns -1 if the wall would run off the board.
function mirrorWallId(id) {
    id = parseInt(id, 10);
    var row = Math.floor(id / 17), col = id % 17;
    if (row % 2 === 1) {                 // horizontal wall: engine grows to higher columns
        if (col < 2) return -1;          // would run off the (visual) right edge
        return id - 2;
    }
    if (row < 2) return -1;              // vertical wall: engine grows to higher rows; would run off the bottom
    return id - 2 * 17;
}
// online.js asks for the id to SEND to the opponent (the opponent's board is not flipped,
// so it needs the real engine id, not the id of the slot I clicked).
window.QWallAnchor = function (p) {
    return (viewFlipped() && p && p.nodeType === 1) ? mirrorWallId(p.id) : p.id;
};

// Only a real mouse click (an element) is mirrored. A wall replayed from the opponent
// comes in as a plain {id} that is already an engine id, so it is passed through as is.
wallf = function (wl) {
    if (!viewFlipped() || !wl || wl.nodeType !== 1) return _wallfBase(wl);
    var id = mirrorWallId(wl.id);
    if (id < 0) return;
    return _wallfBase({ id: id });
};

var _resignBase = resignF;
resignF = function () {
    if (!iPlayP2()) return _resignBase();
    if (allow != 1) return;
    resign.style.display = "none";
    del.classList = "win";
    del.style.display = "block";
    rules.style.display = "none";
    allow = 0;
    wina++;                                    // the computer (player 1) gets the point
    del.innerHTML = "you lose! <br /> <br /> click for the main menu";
};

// When a game starts and the computer is player 1, it makes the first move.
var _gameBase = game;
game = function () {
    _gameBase();
    flipBoard(viewFlipped());
    if (iPlayP2() && tor === 0) runComputerTurn(600);
};
// Turn the board upside down (on = true) or back the right way up (on = false).
// It uses an attribute, not a class, because BMM2 compares games.classList to "game".
function flipBoard(on) {
    games.removeAttribute("data-flip");
    games.style.transformOrigin = "";
    if (!on) return;
    // The frame is a few pixels taller than the squares, so rotate around the middle of the SQUARES
    // (measured while the board is still the right way up) and the flipped board lines up with the normal one.
    var tiles = games.querySelectorAll("button");
    var box = games.getBoundingClientRect();
    if (tiles.length && box.height > 0) {
        var first = tiles[0].getBoundingClientRect(), last = tiles[tiles.length - 1].getBoundingClientRect();
        games.style.transformOrigin = "50% " + (((first.top + last.bottom) / 2) - box.top) + "px";
    }
    games.setAttribute("data-flip", "1");
}

// ===================== flipped board (when I play second) =====================
var flipCss = document.createElement("style");
flipCss.textContent =
    // turn the whole board around (only while it is the game board, not the rules screen)
    "#s[data-flip].game{transform:rotate(180deg)}" +
    // turn the pawn pictures back so they are not upside down
    "#s[data-flip].game .playerb,#s[data-flip].game [class^='playeras']{transform:rotate(180deg)}";
document.head.appendChild(flipCss);
