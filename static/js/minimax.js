function staticScore(pc) {
    /* return score change to white player by loss of PC */
    if (!pc || (pc == '.')) {
        return 0;
    }
    var pieceScores = {
        'P':1,  'r':-5, 'n':-3, 'b':-3, 'q':9,  'k':-99,
        'p':-1, 'R':5,  'N':3,  'B':3,  'Q':9,  'K':99
    };
    return pieceScores[pc] * -1;
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