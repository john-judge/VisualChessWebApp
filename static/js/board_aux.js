class Move {
    constructor(srcLoc,san) {
        this.san = san; //Standard Algebraic Notation
        this.src = srcLoc;
        san = san.split("+")[0].split("#")[0];
        san = san.split("=");
        this.dst = string_to_loc(san[0].slice(-2));
        if(san.length < 2) {
            this.promotion = null;
        } else {
            this.promotion = san[1];
        }
        if(this.san == 'O-O') {
            console.log(this.src.i,this.src.j)
            this.dst = new Loc(this.src.i + 2,this.src.j);
        } else if(this.san == 'O-O-O') {
            this.dst = new Loc(this.src.i - 2,this.src.j);
        }
    }

    areLocMatches(src,dst) {
        return this.src.loc_equals(src) && this.dst.loc_equals(dst);
    }

    isMoveMatch(src,dst,promo) {
        /* is SRC -> DST and PROMO match this move's data? */
        return areLocMatches(src,dst) && (this.promotion == promo);
    }

    moveRepr() {
        return ("(" + this.san + "): <br /> from " +
        this.src.to_string() +
        " to " +
        this.dst.to_string());
    }

    isPromotion() {
        return (this.promotion != null);
    }
}

class Loc {
    /* can be pixel location or board location,
        depending on context */
    constructor(i,j) {
        this.i = i;
        this.j = j;
    }
    loc_equals(loc2) {
        /* is LOC equivalent to arg LOC2? */
        return ((this.i == loc2.i) && (this.j == loc2.j));
    }

    to_index() {
        return (this.i + (7 - this.j) * 8);
    }

    to_pixel(sideLen) {
        var x = this.i * sideLen;
        var y = this.j * sideLen;
        return new Loc(x,y);
    }

    to_square(sideLen) {
        var x = Math.floor(this.i / sideLen);
        var y = Math.floor(this.j / sideLen);
        return new Loc(x,y);
    }

    to_string() {
        /* return two-char string*/
        var ranks = ['a', 'b','c', 'd', 'e', 'f', 'g', 'h'];
        return ranks[this.i] + (this.j + 1);
    }
}

function string_to_loc(s) {
    if (s.length > 2) {
        s = s.slice(1,3);
    }
    var ranks = {'a':0, 'b':1, 'c':2, 'd':3,
                'e':4, 'f':5, 'g':6, 'h':7};
    var i = ranks[s.charAt(0)];
    var j = parseInt(s.charAt(1)) - 1;
    return new Loc(i,j);
}

function get_click_location(canvas, event) {
    var bounds = canvas.getBoundingClientRect();
    var x = event.clientX - bounds.left;
    var y = event.clientY - bounds.top;
    var loc = new Loc(x,y);
    return loc;
}

function isLightColor(i,j) {
    return (((i % 2 == 0) && (j % 2 == 0)) ||
                (i % 2 == 1) && (j % 2 == 1));
}

function get_piece_art_filepath(sq) {
    /* returns filepath to piece art, or "" if empty square */
    if((sq == '.') || (sq == "-")) {
        return "";
    } /* convention: white is capitalized letters */
    var file_lookup = {
        'P':"white_pawn.png",
        'p':"black_pawn.png",
        'r':"black_rook.png",
        'n':"black_knight.png",
        'b':"black_bishop.png",
        'q':"black_queen.png",
        'k':"black_king.png",
        'R':"white_rook.png",
        'N':"white_knight.png",
        'B':"white_bishop.png",
        'Q':"white_queen.png",
        'K':"white_king.png"
    };
    var lookup = file_lookup[sq];
    if (lookup != undefined) {
        return "/static/png/piece_art/" + lookup;
    } else {
        return "";
    }
}

function print_highlight(sideLen,topLeft,highLit) {
    var b = document.getElementById('board');
    var ctx = b.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = highLit;
    var shrinkBy = 6;
    ctx.lineWidth = shrinkBy.toString();
    var hiSideLen = sideLen - shrinkBy;
    var hx = topLeft.i + shrinkBy/2; var hy = topLeft.j + shrinkBy/2;
    ctx.rect(hx,hy,hiSideLen,hiSideLen);
    ctx.stroke();
}

function print_square(color,sideLen,topLeft,pc) {
    var b = document.getElementById('board');
    var ctx = b.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(topLeft.i,topLeft.j,sideLen,sideLen);
    var fp_image = get_piece_art_filepath(pc);

    if (fp_image) {
        var image = new Image();
        var b = document.getElementById('board');
        var ctx = b.getContext('2d');
        image.src = fp_image;
        image.onload = function () {//waits for image to load
            ctx.drawImage(image,topLeft.i,topLeft.j,sideLen,sideLen);
        };
    }
}

function reformatBoardString(ascii) {
    console.log(ascii);
    ascii = ascii.split("+")[2].split("\n");
    var ret = "";
    for(var i = 1; i < 9; i++) { // 1-index
        var row = ascii[i].slice(4,28);
        row = row.trim();
        ret = ret + row.split("  ").join("");
    }
    if (ret.length != 64) {
        console.log("error: board string length format err");
    }
    return ret;
}

function start_game() {
    var promButton = document.getElementById('promoSelect');
    promButton.style.display = "none";
    var b = document.getElementById('board');
    b.style.display = "block";
    b.margin = "auto";          var light = "#DFE8EE";
    b.padding="0";              var dark = "#2970A0";
    var gameBoard = new Board(600,light,dark);
    b.gameBoardState = gameBoard;
    gameBoard.printBoard();
}

function printReadout(message) {
    var readout = document.getElementById('readout');
    readout.innerHTML = message;
}