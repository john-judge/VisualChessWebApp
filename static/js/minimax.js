function staticScoreUpdate(update,isBlack,promo) {
    /* return score change to white player by loss of PC */
    var pcCaptured = update.captured;
    var pieceScores = {'p':1, 'r':5, 'n':3, 'b':3, 'q':9, 'k':99};
    var capScore = (!pcCaptured ? 0 :
    (pieceScores[pcCaptured] * (isBlack ? -1 : 1)));
    var promScore = 0;
    if(update.flags.includes("p")) {
        console.log("promo to " + promo);
        promScore = (pieceScores[promo] - 1) * (isBlack ? -1 : 1) ;
    }
    return capScore + promScore;
}

function machineRandom(boardState) {
    /* a chess AI that selects moves randomly */
    var allMoves = boardState.gameState.moves();
    var randInt = Math.floor(Math.random() * allMoves.length);
    return allMoves[randInt];
}

function minimax(boardState,depth,isMaxPlayer) {
    /* return minimax best move. */
    if((depth == 0) || boardState.gameState.game_over()) {
        return [boardState.score,null];
    }
    var allMoves = gameState.moves();
    var currMinMax, currMove;
    if(isMaxPlayer) {
        currMinMax = -999;
        for(var i = 0; i < allMoves.length; i++) {
            var moveVal =
            minimax(boardState.makeMove(allMoves[i]),depth-1, false)[0];

            if (moveVal > currMinMax) {
                currMinMax = moveVal;
                currMove = allMoves[i];
            }
        }
        boardState.undoMove();
        return [currMinMax, currMove];
    } else {
        currMinMax = 999;
        for(var i = 0; i < allMoves.length; i++) {
            var moveVal =
            minimax(boardState.makeMove(allMoves[i]),depth-1, true)[0];

            if (moveVal < currMinMax) {
                currMinMax = moveVal;
                currMove = allMoves[i];
            }
        }
        boardState.undoMove();
        return [currMinMax,currMove];
    }
}

function machineMinimax(boardState) {
    /* chess AI: vanilla minimax */
    return minimax(boardState,1,true)[1];
}





