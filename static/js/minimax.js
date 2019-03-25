/*
Next to do:

alpha beta pruning
silent (no graphics) mode and toggle option; mid-execution switch

make staticScoring more powerful--advance pawns, control center, etc

*/

class Player {
    constructor(playType,playerColor,isShown,sleepTime) {
        /* 0-human; else PLAYTYPE is ply number of machine player */
        this.playType = playType;
        this.playerColor = playerColor; //black or white
        this.minimaxPly = playType;

        /* options/whether to print graphics */
        this.isShown = isShown;
        this.sleepTime = (isShown ? sleepTime : 0);

        /* tracks score of last gameState passed to its method */
        this.score = 0;
        this.pieceScores = {'p':1, 'r':5, 'n':3, 'b':3, 'q':9, 'k':99};

    }

    setPly(nPly) {
        if(nPly > 0 && nPly < 15) {
            this.playType = nPly;
        }
    }

    async takeTurn(boardState) {
        var update = null;
        if(this.playType) {
            let mv = await this.machineMinimax(boardState);
            console.log("moving" + mv);
            console.log("moving" + mv.san);
            update = boardState.makeMove(mv);
        } else {
            /* if human, let this thread return, and await Event listener;
                playGame thread is restarted when human player acts */
            update = null;
        }
        boardState.endTurn(update, this.playerColor);
    }

    staticScoreUpdate(mv,isBlack) {
        /* return score change; white is positive */
        var capScore = (!mv.captured ? 0 :
            (this.pieceScores[mv.captured] * (isBlack ? 1 : -1)));
        var promScore = (!mv.promotion ? 0 :
            (this.pieceScores[mv.promotion] - 1 ) * (isBlack ? 1 : -1));

        this.score += capScore + promScore;
    }

    machineRandom(boardState) {
        /* a chess AI that selects moves randomly */
        var allMoves = boardState.gameState.moves();
        var randInt = Math.floor(Math.random() * allMoves.length);
        return allMoves[randInt];
    }

    async minimax(boardState,depth,isMaxPlayer) {
        /* return minimax best move. */
        var isShown = this.showGraphics;
        if((depth == 0) || boardState.gameState.game_over()) {
            return [this.score, null];
        }
        var allMoves = boardState.gameState.moves({verbose : true});
        var currMinMax, currMove;
        if(isMaxPlayer) {
            currMinMax = -999;
            for(var i = 0; i < allMoves.length; i++) {
                var oldScore = this.score;
                var update = boardState.makeMove(allMoves[i], this.isShown);
                this.staticScoreUpdate(update,true);

                let moveVal = await this.minimax(boardState,depth-1, false);
                if(this.isShown) {await sleep(this.sleepTime);}
                if ((moveVal[0] > currMinMax) ||
                ((moveVal[0] == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal[0];
                    currMove = allMoves[i];
                }
                boardState.undoMove(this.isShown);
                this.score = oldScore;
                if(this.isShown) {await sleep(this.sleepTime);}
            }
            return [currMinMax, currMove];
        } else {
            currMinMax = 999;
            for(var i = 0; i < allMoves.length; i++) {
                var oldScore = this.score;
                var update = boardState.makeMove(allMoves[i], this.isShown);
                this.staticScoreUpdate(update,false);

                let moveVal = await this.minimax(boardState,depth-1, true);
                if(this.isShown) {await sleep(this.sleepTime);}
                if ((moveVal[0] < currMinMax) ||
                ((moveVal[0] == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal[0];
                    currMove = allMoves[i];
                }
                boardState.undoMove(this.isShown);
                this.score = oldScore;
                if(this.isShown) {await sleep(this.sleepTime);}
            }
            return [currMinMax,currMove];
        }
    }

    async machineMinimax(boardState) {
        /* chess AI: vanilla minimax */
        var minimaxPly = this.playType;
        var isMaxPlayer = (this.playerColor == 'b');
        let minimaxed = await
            this.minimax(boardState,minimaxPly,isMaxPlayer);
        return minimaxed[1];
    }




}
