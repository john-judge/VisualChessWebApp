class Board {
    constructor(screen_size,light,dark,score_fn,machinePlayer) {
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

        /*score evaluation; positive means white is winning*/
        this.score = 0;
        this.scoreFn = score_fn;

        /* AI options, verbosity, depth, algorithm type */
        this.machinePlayer = machinePlayer;
        this.showGraphics = true;
        this.minimaxPly = 3;
        this.sleepTime = 2; // milliseconds

        /* colorings of squares/highlights: */
        this.light = light;
        this.dark = dark;
        this.hliteFriend = "#FF2828"; /* red friendly highlights */
        this.hliteEnemy = "#FFF728" /* yellow enemy highlights */
    }

    setSleepTime(sleepTime) {
        this.sleepTime = sleepTime;
    }

    setMinimaxPly(ply) {
        this.minimaxPly = ply;
    }

    setGraphics(isShown) {
        this.showGraphics = isShown;
    }

    async AIPlayer() {
        let mv = await this.machinePlayer(this);
        return mv;
    }

    scoreEvalUpdate(update,isBlack) {
        var prevPc = update.piece;
        var currPc = this.getPiece(string_to_loc(update.to)).toLowerCase();
        if(prevPc == currPc) {
            currPc = null; // no promotion
        }
        return this.scoreFn(update,isBlack,currPc);
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
                var hLiteCol = (isEnemy ? this.hliteEnemy : this.hliteFriend);
                if(this.isHighlighted(pcLoc)) {
                    print_highlight(this.sideLen,sqLoc,hLiteCol);
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
        var leng = moves.length;
        for(var i = 0; i < leng; i++) {
            this.addHighlight(moves[i].dst);
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
        }
        else if (this.gameState.game_over()) {
            printReadout("Neither player wins; but the true prize is the journey.");
        }
    }

    makeMove(move,isSan=false,showGraphics=true) {
        var update =
        (isSan ? this.gameState.move(move) : this.gameState.move(move.san));
        this.moveListConsider = [];
        this.selectedLoc = null;
        if(showGraphics) {this.clearHighlights();}
        if(update) {
            var blackTurn = (this.gameState.turn() == 'b');
            this.score += this.scoreEvalUpdate(update,blackTurn);
            console.log("score:" + this.score);
            if(showGraphics) {
                var oldSquares = this.squares;
                this.squares = reformatBoardString(this.gameState.ascii());
                this.updateBoard(oldSquares); // quick minimal render
            }

            if(!isSan) {
                printReadout("Last move " + move.moveRepr());
            }
            this.checkEndGame();
        } else {
            console.log("invalid move:" + (isSan ? move :move.san));
        }
    }


    undoMove(showGraphics=true) {
        var update = this.gameState.undo();
        if(update) {
            if(showGraphics) {
                var oldSquares = this.squares;
                this.squares = reformatBoardString(this.gameState.ascii());
                this.updateBoard(oldSquares); // quick minimal render
            }
            if(update.flags.includes("p")) {

            }
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
            if(this.gameState.turn() != 'b'){
                this.playMachineTurn();
            }

        }
        var promButton = document.getElementById('promoSelect');
        promButton.style.display = "none";
    }

    handleClick(clickPxLoc) {
        if(this.gameState.turn() == 'b') {
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
                    if(this.gameState.turn() != 'b') {
                        this.playMachineTurn();
                    }
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

    async playMachineTurn() {
        await sleep(40);
        let moveStr = await this.AIPlayer();
        var update = this.gameState.move(moveStr);

        /*add in highlight tracers later */
        if(update) {
            var srcLoc = string_to_loc(update.from);
            var dstLoc = string_to_loc(update.to);

            var move = new Move(srcLoc,moveStr);
            this.addHighlight(srcLoc);
            this.addHighlight(dstLoc);

            var oldSquares = this.squares;
            this.squares = reformatBoardString(this.gameState.ascii());
            this.updateBoard(oldSquares);

            var blackTurn = this.gameState.turn() == 'b';
            this.score += this.scoreEvalUpdate(update,blackTurn);
            console.log("score:" + this.score);

            this.printHighlights(1);
            printReadout("Last move (white) " + move.moveRepr());
            this.checkEndGame();
        }
    }


}
