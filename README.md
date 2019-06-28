# Web GUI for chess AI visualization

Source code for web app <a href="http://visualchess.pythonanywhere.com/"> "Visualize Possible Chess Moves" </a>, which concisely displays up to hundreds of thousands of possible moves explored by a chess algorithm.


![demo0](static/chess_demo.gif)


Playing a chess game against a human player, this web app offers a customizable visualization of the possible-move tree traversed by an alpha-beta pruning minimax algorithm with fast move ordering, as the machine iterates through all possibilities and searches for the maximum strategic score assuming the human opponent will attempt to minimize this score. 

![demo1](static/demo.png)




Interesting features (sidebar):
- Select machine's ply (i.e. depth of move tree search)
- Disable animation
- Select animation speed

Basic features
- Restart game
- Red board highlights to aid human player in move selection
- Yellow board highlighting to show user the machine's last move




Next ideas (not currently planning further development):
- load/store game states
- parallel execution (web workers) when animation disabled
              

About
  <p>
                Legal chess move generation library: courtesy of
                <a href="https://github.com/jhlywa/chess.js/"> jhlywa </a>
                <br> 
                This site is deployed using PythonAnywhere.com.
                The GUI and chess intelligence are all written from scratch in pure Javascript
                Information on chess AI:
                <a href="https://en.wikipedia.org/wiki/Evaluation_function#In_chess">
                static evaluation</a>,
                <a href="https://en.wikipedia.org/wiki/Minimax">minimax</a> and
                <a href="https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning">
                     alpha-beta pruning
                </a>

