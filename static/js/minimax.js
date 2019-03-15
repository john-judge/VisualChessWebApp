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

async function minimax(boardState,depth,isMaxPlayer,sleepTime=5) {
    /* return minimax best move. */
    if((depth == 0) || boardState.gameState.game_over()) {
        return [boardState.score, null];
    }
    var allMoves = boardState.gameState.moves();
    var currMinMax, currMove;
    if(isMaxPlayer) {
        currMinMax = -999;
        for(var i = 0; i < allMoves.length; i++) {
            boardState.makeMove(allMoves[i],san=true);
            let moveVal = await minimax(boardState,depth-1, false);
            await sleep(sleepTime);
            if (moveVal[0] > currMinMax) {
                currMinMax = moveVal;
                currMove = allMoves[i];
            }
            boardState.undoMove();
            await sleep(sleepTime);
        }
        return [currMinMax, currMove];
    } else {
        currMinMax = 999;
        for(var i = 0; i < allMoves.length; i++) {
            boardState.makeMove(allMoves[i],san=true);
            let moveVal = await minimax(boardState,depth-1, true);
            await sleep(sleepTime);
            if (moveVal[0] < currMinMax) {
                currMinMax = moveVal;
                currMove = allMoves[i];
            }
            boardState.undoMove();
            await sleep(sleepTime);
        }
        return [currMinMax,currMove];
    }
}

async function machineMinimax(boardState,ply=3) {
    /* chess AI: vanilla minimax */
    let minimaxed = await minimax(boardState,ply,true);
    return minimaxed[1];
}





