function get_click_location(canvas, event) {
    var bounds = canvas.getBoundingClientRect();
    var x = event.clientX - bounds.left;
    var y = event.clientY - bounds.top;
    var loc = new Loc(x,y);
    return loc;
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
        return this.i + this.j * 8;
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
}

function isLightColor(i,j) {
    return (((i % 2 == 0) && (j % 2 == 0)) ||
                (i % 2 == 1) && (j % 2 == 1));
}

function get_piece_art_filepath(sq) {
    /* returns filepath to piece art, or "" if empty square */
    if(sq == '-') {
        return "";
    }
    var file_lookup = {
        'p':"white_pawn.png",
        'P':"black_pawn.png",
        'R':"black_rook.png",
        'N':"black_knight.png",
        'B':"black_bishop.png",
        'Q':"black_queen.png",
        'K':"black_king.png",
        'r':"white_rook.png",
        'n':"white_knight.png",
        'b':"white_bishop.png",
        'q':"white_queen.png",
        'k':"white_king.png"
    };
    return "/static/png/piece_art/" + file_lookup[sq];
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
    if (pc != '-') {
        var fp_image = get_piece_art_filepath(pc);
        var image = new Image();
        var b = document.getElementById('board');
        var ctx = b.getContext('2d');
        image.src = fp_image;
        image.onload = function () {//waits for image to load
            ctx.drawImage(image,topLeft.i,topLeft.j,sideLen,sideLen);
        };
    }
}