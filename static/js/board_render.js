class Board {
    constructor(screen_size,light,dark) {
        this.gameState = new Chess();
        /* 64 char string, view as 8x8 grid: */
        this.squares = reformatBoardString(this.gameState.ascii());
        /* two 32-bit integers, 1: highlighted */
        this.highlights1 = 0;
        this.highlights2 = 0;
        this.selectedLoc = null;
        this.moveListConsider = [];
        this.playing = true;
        this.screen_size = screen_size; // square
        this.sideLen = screen_size / 8;
        /* colorings of squares/highlights: */
        this.light = light;
        this.dark = dark;
        this.hliteColor = "#FF2828"; // hard coded: red highlights
    }
    isHighlighted(loc) {
        /* return the highlight state of LOC */
        var ind = loc.to_index();
        if (ind > 31) {
            return (this.highlights2 >>> ind) & 1;
        }
        return (this.highlights1 >>> ind) & 1;
    }
    getPiece(loc) {
        if(!loc) {
            return null;
        }
        return this.squares.charAt(loc.to_index());
    }
    add_highlight(loc) {
        /* set hi lite state of LOC */
        var ind = loc.to_index();
        if (ind > 31) {
            this.highlights2 = this.highlights2 | (1 << ind);
        } else {
            this.highlights1 = this.highlights1 | (1 << ind);
        }
    }
    clearHighlights() {
        /* remove highlights from list and print blank-outs*/
        for(var i = 0; i < 8; i++) {
            for(var j = 0; j < 8; j++) {
                var pcLoc = new Loc(i,j)
                var sqLoc = pcLoc.to_pixel(this.sideLen);
                var isLight = isLightColor(i,j);
                var color;
                if(isLight) {
                    color = this.light;
                } else {
                    color = this.dark;
                }
                if(this.isHighlighted(pcLoc)) {
                    print_highlight(this.sideLen,sqLoc,color);
                }
            }
        }
        this.highlights2 = 0; this.highlights1 = 0;
    }
    printBoard() {
        for(var i = 0; i < 8; i++) {
            for(var j = 0; j < 8; j++) {
                var pcLoc = new Loc(i,j)
                this.printLoc(pcLoc);
                if(this.isHighlighted(pcLoc)) {
                    print_highlight(this.sideLen,sqLoc,this.hliteColor);
                }
            }
        }
    }
    printHighlights() {
        /* (instead of rendering and printing whole board) update only new highlights */
        for(var i = 0; i < 8; i++) {
            for(var j = 0; j < 8; j++) {
                var pcLoc = new Loc(i,j)
                var sqLoc = pcLoc.to_pixel(this.sideLen);
                var isLight = isLightColor(i,j);
                var color;
                if(isLight) {
                    color = this.light;
                } else {
                    color = this.dark;
                }
                var pc = this.getPiece(pcLoc);
                var highLit = "";
                if(this.isHighlighted(pcLoc)) {
                    print_highlight(this.sideLen,sqLoc,this.hliteColor);
                }
            }
        }
    }
    getMoveList(srcLoc) {
        /* returns LOC to which can move from SRCLOC */
        var srcStr = srcLoc.to_string();
        var mvSans = this.gameState.moves({square: srcStr});
        this.moveListConsider = [];
        for(var i = 0; i < mvSans.length; i++) {
            this.moveListConsider.push(new Move(srcLoc,mvSans[i]));
        }
        return this.moveListConsider;
    }
    highlightMoveList(moves) {
        console.log("Available moves:")
        var leng = moves.length;
        for(var i = 0; i < leng; i++) {
            this.add_highlight(moves[i].dst);
            console.log(moves[i].moveRepr());
        }
    }
    printLoc(pcLoc) {
        var sqLoc = pcLoc.to_pixel(this.sideLen);
        var isLight = isLightColor(pcLoc.i,pcLoc.j);
        var color;
        if(isLight) {
            color = this.light;
        } else {
            color = this.dark;
        }
        var pc = this.getPiece(pcLoc);
        var highLit = "";
        print_square(color,this.sideLen,sqLoc,pc);
    }
    updateBoard(oldSquares) {
        /* reprint only squares that have changed */
        for(var i = 0; i < 8; i++) {
            for(var j = 0; j < 8; j++) {
                var pcLoc = new Loc(i,j);
                var ind = pcLoc.to_index();
                if(this.getPiece(pcLoc) != oldSquares.charAt(ind)) {
                    this.printLoc(pcLoc);
                }
            }
        }
    }
    makeMove(move) {
        var update = this.gameState.move(move.san);
        this.moveListConsider = [];
        this.selectedLoc = null;
        this.clearHighlights();
        if(update) {
            var oldSquares = this.squares;
            this.squares = reformatBoardString(this.gameState.ascii());
            var src = update.from;          var dst = update.to;
            src = string_to_loc(src);       dst = string_to_loc(dst);
            this.printLoc(src);             this.printLoc(dst);
            this.updateBoard(oldSquares); // replace with quick minimal update
            printReadout("Last move " + move.moveRepr());
        } else {
            console.log("invalid move:" + move.san);
        }
    }

    getMoveListMatches(srcLoc,dstLoc) {
        /* search this.moveListConsider for loc matches; else return null */
        if(!this.getPiece(srcLoc)) {
            return null;
        }
        var matches = [];
        var len = this.moveListConsider.length;
        for(var i = 0; i < len; i++) {
            var mv = this.moveListConsider[i];
             if (mv.areLocMatches(srcLoc,dstLoc)) {
                matches.push(mv);
            }
        }
        if(matches == []) {
            return null;
        } else {
            return matches;
        }
    }

    handlePromotion(selectionIndex) {
        if(!this.possiblePromos) {
            console.print("error: promotion cache found empty");
        } else {
            this.makeMove(this.possiblePromos[selectionIndex]);
        }
        var promButton = document.getElementById('promoSelect');
        promButton.style.display = "none";
    }

    handle_click(clickPxLoc) {
        var clickSqLoc = clickPxLoc.to_square(this.sideLen);
        var clickStr = clickSqLoc.to_string();
        var moves = this.getMoveListMatches(this.selectedLoc,clickSqLoc);
        if(moves && moves.length > 0) {
            /* user has selected a move: */
            if(moves.length == 4 || moves[0].isPromotion()) {
                printReadout("Pawn promotion: " +
                "Selected desired piece type.");
                var promButton = document.getElementById('promoSelect');
                promButton.style.display = "block";
                this.possiblePromos = moves;
            } else {
                this.makeMove(moves[0]);
            }

        } else {
            /* user is considering new move src location */
            this.clearHighlights();
            this.add_highlight(clickSqLoc);
            var moveList = this.getMoveList(clickSqLoc);
            this.highlightMoveList(moveList);
            this.printHighlights();
            this.selectedLoc = clickSqLoc;
        }
    }
}
