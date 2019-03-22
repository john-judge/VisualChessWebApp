class Board {
    constructor(screen_size,colors,players) {
        this.gameState = new Chess();
        /* 64 char string, view as 8x8 grid: */
        this.squares = reformatBoardString(this.gameState.ascii());
        /* two 32-bit integers, 1: highlighted */
        this.highlights1 = 0;
        this.highlights2 = 0;
        this.selectedLoc = null;
        this.moveListConsider = [];
        this.screen_size = screen_size; // square
        this.sideLen = screen_size / 8;
        this.ended = false;

        /* AI or human players */
        this.player0 = players[0];
        this.player1 = players[1];

        /* colorings of squares/highlights: */
        this.light = colors[0];
        this.dark = colors[1];
        this.hlite0 = "#FF2828"; /* red highlights */
        this.hlite1 = "#FFF728" /* yellow highlights */
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

    addHighlight(loc) {
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

    printHighlights(isEnemy) {
        /* (instead of rendering and printing whole board) update only new highlights */
        for(var i = 0; i < 8; i++) {
            for(var j = 0; j < 8; j++) {
                var pcLoc = new Loc(i,j)
                var sqLoc = pcLoc.to_pixel(this.sideLen);
                var pc = this.getPiece(pcLoc);

                var color = (isLightColor(i,j) ? this.light : this.dark);
                var hLiteCol = (isEnemy ? this.hlite1 : this.hlite0);
                if(this.isHighlighted(pcLoc)) {
                    print_highlight(this.sideLen,sqLoc,hLiteCol);
                }
            }
        }
    }

    getMoveList(srcLoc) {
        /* returns LOC to which can move from SRCLOC */
        var srcStr = srcLoc.to_string();
        var mvObjs = this.gameState.moves({square: srcStr, verbose: true});
        this.moveListConsider = mvObjs;
        for(var i = 0; i < mvSans.length; i++) {
            this.moveListConsider.push(new Move(mvObjs[i]));
        }
        return this.moveListConsider;
    }

    highlightMoveList(moves) {
        var leng = moves.length;
        for(var i = 0; i < leng; i++) {
            this.addHighlight(moves[i].to);
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

    checkEndGame() {
        if (this.gameState.in_checkmate()) {
            var loser = this.gameState.turn();
            if(loser == 'b') {
                printReadout("White has won; but the true prize is the journey.");
            } else {
                printReadout("Black has won; but the true prize is the journey.");
            }
            this.ended = true;
            return true;
        } else if (this.gameState.game_over()) {
            printReadout("Neither player wins; but the true prize is the journey.");
            return true;
            this.ended = true;
        } else {
            return false;
        }
    }

    flushGraphics() {
        /* update board GUI with quick, minimal render */
        var oldSquares = this.squares;
        this.squares = reformatBoardString(this.gameState.ascii());
        this.updateBoard(oldSquares);
    }

    makeMove(move,showGraphics) {
        var update = this.gameState.move(move.san);
        this.moveListConsider = [];
        this.selectedLoc = null;
        if(showGraphics) {this.clearHighlights();}
        if(update) {
            if(showGraphics) {this.flushGraphics();}
        } else {
            console.log("invalid move:" + move.san);
        }
    }

    undoMove(showGraphics) {
        var update = this.gameState.undo();
        if(update) {
            if(showGraphics) {
                this.flushGraphics();
            }
        }
    }

    getMoveListMatches(srcLoc,dstLoc) {
        /* search this.moveListConsider for loc matches */
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
        return matches;
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

    handleClick(clickPxLoc) {
        if(this.gameState.turn() == 'b') {
            var clickSqLoc = clickPxLoc.to_square(this.sideLen);
            var clickStr = clickSqLoc.to_string();
            var moves = this.getMoveListMatches(this.selectedLoc,clickSqLoc);
            if(moves && moves.length) {
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
                this.addHighlight(clickSqLoc);
                var moveList = this.getMoveList(clickSqLoc);
                this.highlightMoveList(moveList);
                this.printHighlights();
                this.selectedLoc = clickSqLoc;
            }
        }
    }

    async playTurn() {
        /* play one turn, then wake other player. */
        if(this.gameState.turn() == this.player0.playerColor) {
            let move = await this.player0.takeTurn(this);
        } else {
            let move = await this.player1.takeTurn(this);
        }
        if(move) {
            var update = this.makeMove(move,true);
        }
        /*add in highlight tracers later */
        if(update) {
            var srcLoc = string_to_loc(update.from);
            var dstLoc = string_to_loc(update.to);

            var move = new Move(move);
            board.addHighlight(srcLoc);
            board.addHighlight(dstLoc);

            var oldSquares = board.squares;
            board.squares = reformatBoardString(board.gameState.ascii());
            board.updateBoard(oldSquares);

            board.printHighlights(1);
            printReadout("Last move(" + this.playerColor + ") "  + move.moveRepr());
        }

        this.checkEndGame();
    }



}
