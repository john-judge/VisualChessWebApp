/*
Next to do:

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

    setGraphics(isShown) {
        this.isShown = isShown;
    }

    setSleepTime(st) {
        if(st >= 0 && this.isShown) {
            this.sleepTime = st;
        }
    }

    async takeTurn(boardState) {
        var update = null;
        if(this.playType) {
            let mv = await this.machineMinimax(boardState);
            update = boardState.makeMove(mv);
        } else {
            /* if human, let this thread return, and await Event listener;
                playGame thread is restarted when human player acts */
            update = null;
        }
        boardState.endTurn(update, this.playerColor);
    }

    locScore(loc) {
        /* assign a score based on controlling board center */
        return 0.05 * (7 - Math.abs(3.5 - loc.i) - Math.abs(3.5 - loc.j));
    }

    staticScoreUpdate(mv,isBlack) {
        /* return score change; black is positive-favorable*/
        mv = new
            Move(mv.san,mv.from,mv.to,mv.piece,mv.flags,mv.captured,mv.promotion);
        var capScore = (!mv.captured ? 0 :
            this.pieceScores[mv.captured]);
        var promScore = (!mv.promotion ? 0 :
            this.pieceScores[mv.promotion] - 1);
        var miscScore = (mv.enPassant ? 0.05 : 0) + (mv.isCastling ? 2.5 : 0)
                    + (mv.piece == 'p' ? 0.25 : 0) + (mv.PawnTwoSquare ? 0.1 : 0)
                    + this.locScore(mv.dst);

        this.score += ((capScore + promScore + miscScore) * (isBlack ? 1 : -1));
    }

    sortMoves(moveList) {
        /* sort moves: capture moves at front */
        var front = [];
        var other = [];
        for(var i = 0; i < moveList.length; i++) {
            var f = moveList[i].flags;
            if(f.includes("c") || f.includes("p")) {
                front.push(moveList[i]);
            } else {
                other.push(moveList[i]);
            }
        }
        return front.concat(other);
    }

    async minimax(boardState,depth,isMaxPlayer,alpha,beta) {
        /* return minimax best move. */
        var isShown = this.showGraphics;
        if((depth == 0) || boardState.gameState.game_over()) {
            return [this.score, null];
        }
        var allMoves = boardState.gameState.moves({verbose : true});
        var currMinMax, currMove;
        allMoves = this.sortMoves(allMoves);

        if(isMaxPlayer) {
            currMinMax = -999;
            for(var i = 0; i < allMoves.length; i++) {
                var oldScore = this.score;
                var update = boardState.makeMove(allMoves[i], this.isShown);
                this.staticScoreUpdate(update,true);

                let moveVal =
                    (await this.minimax(boardState,depth-1, false,alpha,beta))[0];

                if(this.isShown) {await sleep(this.sleepTime);}
                if ((moveVal > currMinMax) ||
                ((moveVal == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal;
                    currMove = allMoves[i];
                }
                boardState.undoMove(this.isShown);
                this.score = oldScore;
                if(this.isShown) {await sleep(this.sleepTime);}

                /* alpha-beta pruning: break eval if proven rest is no better */
                alpha = Math.max(alpha,moveVal);
                if(beta < alpha) {
                    break;
                }
            }
            return [currMinMax, currMove];
        } else {
            currMinMax = 999;
            for(var i = 0; i < allMoves.length; i++) {
                var oldScore = this.score;
                var update = boardState.makeMove(allMoves[i], this.isShown);
                this.staticScoreUpdate(update,false);

                let moveVal =
                    (await this.minimax(boardState,depth-1, true,alpha,beta))[0];

                if(this.isShown) {await sleep(this.sleepTime);}
                if ((moveVal < currMinMax) ||
                ((moveVal == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal;
                    currMove = allMoves[i];
                }
                boardState.undoMove(this.isShown);
                this.score = oldScore;
                if(this.isShown) {await sleep(this.sleepTime);}

                /* alpha-beta pruning: break eval if proven rest is no better */
                beta = Math.min(beta,moveVal);
                if(beta < alpha) {
                    break;
                }
            }
            return [currMinMax,currMove];
        }
    }

    async machineMinimax(boardState) {
        /* chess AI: vanilla minimax */
        var minimaxPly = this.playType;
        var isMaxPlayer = (this.playerColor == 'b');
        let minimaxed = await
            this.minimax(boardState,minimaxPly,isMaxPlayer,-999,999);
        return minimaxed[1];
    }




}
