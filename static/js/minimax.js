function staticScoreUpdate(update,isBlack,promo) {
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
    return capScore + promScore;
}

function machineRandom(boardState) {
    /* a chess AI that selects moves randomly */
    var allMoves = boardState.gameState.moves();
    var randInt = Math.floor(Math.random() * allMoves.length);
    return allMoves[randInt];
}

async function minimax(boardState,depth,isMaxPlayer) {
    /* return minimax best move. */
    var isShown = boardState.showGraphics;
    if((depth == 0) || boardState.gameState.game_over()) {
        return [boardState.score, null];
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

async function machineMinimax(boardState) {
    /* chess AI: vanilla minimax */
    this.minimaxPly = 2;
    let minimaxed = await
    minimax(boardState,this.minimaxPly,true,showGraphics=this.showGraphics);
    console.log("minmax:" + minimaxed);
    return minimaxed[1];
}

/*
Need to refactor methods -- one function, one responsibility

*/




