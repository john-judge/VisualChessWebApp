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


function machineRandom(gameState) {
    /* a chess AI that selects moves randomly */
    var allMoves = gameState.moves();
    var randInt = Math.floor(Math.random() * allMoves.length);
    return allMoves[randInt];
}

function machineGreedy(gameState) {
    /* a chess AI that selects (randomly) among highest scoring moves */
}