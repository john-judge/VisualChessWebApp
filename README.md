# Web GUI for chess AI visualization

Source code for web app <a href="http://visualchess.pythonanywhere.com/"> "Watch My Chess Moves" </a>: for visualizing the stream of conciousness of a chess machine.



Currently, you can visualize the move tree in its board states of an alpha-beta pruning minimax algorithm with fast move ordering, as the machine iterates through all possibilities and searches for the maximum score assuming the opponent (human input) will attempt to minimize the score. 

Interesting features (sidebar):
- Select machine's ply (i.e. depth of move tree search)
- Disable animation
- Select animation speed

Basic features
- Restart game
- Red board highlights to aid human player in move selection
- Yellow board highlighting to show user the machine's last move




Next ideas:
- load/store game states
- parallel execution (web workers) when animation disabled
              

About
  <p>
                Chess move generation and validation library: courtesy of
                <a href="https://github.com/jhlywa/chess.js/"> jhlywa </a>
                <br> 
                This site is deployed using PythonAnywhere.com.
                Informative sources on chess AI:
                <a href="https://en.wikipedia.org/wiki/Evaluation_function#In_chess">
                static evaluation</a>,
                <a href="https://en.wikipedia.org/wiki/Minimax">minimax</a> and
                <a href="https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning">
                     alpha-beta pruning
                </a>

