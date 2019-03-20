/*
Next to do:

create class AIPlayer
-stores/updates score function (instead of in board)
-calls minimax methods

makeMove, add/remove/print highlights/squares, update scores: need to make
1 responsibility per method
then some high level wrappers
*/

class AIPlayer{
    constructor(playType,playerColor,isShown,sleepTime) {
        /* 0-human; else PLAYTYPE is ply number of machine player */
        this.playType = playType;
        this.playerColor = playerColor; //black or white

        /* options/whether to print graphics */
        this.isShown = isShown;
        this.sleepTime = sleepTime;

        /* tracks score of last gameState passed to its method
                    positive means white is winning*/
        this.score = 0;
    }

    async takeTurn(board) {
        if(!this.playType) {
            /*human -- await Event listener */
            while(board.gameState.turn() == this.playerColor) {
                await sleep(30);
            }
        } else {
            playMachineTurn(board);
        }
    }

    staticScoreUpdate(update,isBlack,promo) {
        /* return score change; white is positive */
        var pcCaptured = update.captured;
        var pieceScores = {'p':1, 'r':5, 'n':3, 'b':3, 'q':9, 'k':99};
        var capScore = (!pcCaptured ? 0 :
        (pieceScores[pcCaptured] * (isBlack ? 1 : -1)));
        var promScore = 0;
        if(update.flags.includes("p")) {
            console.log("promo to " + promo);
            promScore = (pieceScores[promo] - 1) * (isBlack ? 1 : -1);
            if(!promScore) {promScore = 0;}
        }
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
        var allMoves = boardState.gameState.moves();
        var currMinMax, currMove;
        if(isMaxPlayer) {
            currMinMax = -999;
            for(var i = 0; i < allMoves.length; i++) {
                var oldScore = boardState.score;
                boardState.makeMove(allMoves[i],san=true,showGraphics=isShown);
                let moveVal = await minimax(boardState,depth-1, false);
                await sleep(boardState.sleepTime);
                if ((moveVal[0] > currMinMax) ||
                ((moveVal[0] == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal[0];
                    currMove = allMoves[i];
                }
                boardState.undoMove(showGraphics=isShown);
                boardState.score = oldScore;
                await sleep(boardState.sleepTime);
            }
            return [currMinMax, currMove];
        } else {
            currMinMax = 999;
            for(var i = 0; i < allMoves.length; i++) {
                var oldScore = boardState.score;
                boardState.makeMove(allMoves[i],san=true,showGraphics=isShown);
                let moveVal = await minimax(boardState,depth-1, true);
                await sleep(boardState.sleepTime);
                if ((moveVal[0] < currMinMax) ||
                ((moveVal[0] == currMinMax) &&
                ((Math.random() * i) > (0.5 * allMoves.length)))) {
                    currMinMax = moveVal[0];
                    currMove = allMoves[i];
                }
                boardState.undoMove(showGraphics=isShown);
                boardState.score = oldScore;
                await sleep(boardState.sleepTime);
            }
            return [currMinMax,currMove];
        }
    }

    async machineMinimax(boardState) {
        /* chess AI: vanilla minimax */
        this.minimaxPly = 2;
        let minimaxed = await
        minimax(boardState,this.minimaxPly,true,showGraphics=this.showGraphics);
        console.log("minmax:" + minimaxed);
        return minimaxed[1];
    }

    async playMachineTurn(board) {
        let moveStr = await this.machineMinimax(this);
        return this.gameState.move(moveStr);

        /*add in highlight tracers later */
        if(update) {
            var srcLoc = string_to_loc(update.from);
            var dstLoc = string_to_loc(update.to);

            var move = new Move(srcLoc,moveStr);
            this.addHighlight(srcLoc);
            this.addHighlight(dstLoc);

            var oldSquares = board.squares;
            this.squares = reformatBoardString(board.gameState.ascii());
            this.updateBoard(oldSquares);

            board.printHighlights(1);
            printReadout("Last move (white) " + move.moveRepr());
        }
    }




}
