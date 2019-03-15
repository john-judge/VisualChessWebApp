# Web GUI for chess AI visualization

Source code for web app <a href="http://visualchess.pythonanywhere.com/"> "Watch My Chess Moves" </a>: for visualizing the stream of conciousness of a chess machine.



Currently, you can visualize the tree in its board states of a 3-ply vanilla minimax, as the machine iterates through all possibilities and searches for the maximum score assuming the opponent (human input) will attempt to minimize the score.





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


Next ideas:
- external-facing option to adjust play speed (sleepTime), ply, graphics verbosity
- implement alpha beta pruning
- load/store game states
              
