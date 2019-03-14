#from parse import Move, MoveList, string_to_board_list, str_to_loc
from flask import Flask, render_template, request

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/about/')
def about():
    return render_template('about.html')


