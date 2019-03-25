/*
Next to do:

create class Player
-stores/updates score function (instead of in board)
-calls minimax methods

makeMove, add/remove/print highlights/squares, update scores: need to make
1 responsibility per method
then some high level wrappers
*/

class Player {
    constructor(playType,playerColor,isShown,sleepTime) {
        /* 0-human; else PLAYTYPE is ply number of machine player */
        this.playType = playType;
        this.playerColor = playerColor; //black or white

        /* options/whether to print graphics */
        this.isShown = isShown;
        this.sleepTime = sleepTime;

        /* tracks score of last gameState passed to its method */
        this.score = 0;
    }

    async takeTurn(boardState) {
        var update = null;
        if(this.playType) {
            let mv = await this.machineMinimax(boardState);
            console.log("moving" + mv.san);
            this.staticScoreUpdate(mv,(this.playerColor == "b"));
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
        var pieceScores = {'p':1, 'r':5, 'n':3, 'b':3, 'q':9, 'k':99};
        var capScore = (!mv.captured ? 0 :
            (pieceScores[mv.captured] * (isBlack ? 1 : -1)));
        var promScore = (!mv.promotion ? 0 :
            (pieceScores[mv.promotion] - 1 ) * (isBlack ? 1 : -1));
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
                var oldScore = boardState.score;
                boardState.makeMove(allMoves[i], this.isShown);
                let moveVal = await this.minimax(boardState,depth-1, false);
                await sleep(boardState.sleepTime);
                if ((moveVal[0] > currMinMax) ||
                ((moveVal[0] == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal[0];
                    currMove = allMoves[i];
                }
                boardState.undoMove(this.isShown);
                boardState.score = oldScore;
                await sleep(boardState.sleepTime);
            }
            return [currMinMax, currMove];
        } else {
            currMinMax = 999;
            for(var i = 0; i < allMoves.length; i++) {
                var oldScore = boardState.score;
                boardState.makeMove(allMoves[i], this.isShown);
                let moveVal = await this.minimax(boardState,depth-1, true);
                await sleep(boardState.sleepTime);
                if ((moveVal[0] < currMinMax) ||
                ((moveVal[0] == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal[0];
                    currMove = allMoves[i];
                }
                boardState.undoMove(this.isShown);
                boardState.score = oldScore;
                await sleep(boardState.sleepTime);
            }
            return [currMinMax,currMove];
        }
    }

    async machineMinimax(boardState) {
        /* chess AI: vanilla minimax */
        this.minimaxPly = 2;
        var isMaxPlayer = (this.playerColor == 'b');
        let minimaxed = await
            this.minimax(boardState,this.minimaxPly,isMaxPlayer);
        return minimaxed[1];
    }




}
