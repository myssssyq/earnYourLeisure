from flask import Flask, render_template, request, session, redirect, json
import sqlite3
import os

app = Flask(__name__,
            static_url_path='',
            static_folder='templates/dist',)

app.secret_key = 'pepega'

@app.route('/', methods = ['POST', 'GET'])
def index():
    return redirect("/register")

@app.route('/home', methods = ['POST', 'GET'])
def home():
    context = dict()
    context['menu'] = "goals"
    if (not session['user']):
        return render_template('dist/404.html')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT * FROM accounts WHERE id = ?', [session['user']['id']])
        user = cursor.fetchone()
        context['user'] = user[0]
        context['wallet'] = user[5]
        cursor.close()
    except:
        print('DATABASE EROOR! ')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT * FROM goals WHERE accountID = ? AND status = ?', [session['user']['id'], 1])
        goals = cursor.fetchall()
        cursor.close()
        context['goals'] = goals
    except:
        print('DATABASE EROOR! ')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT * FROM goals WHERE accountID = ? AND status = ?', [session['user']['id'], 2])
        goals_completed = cursor.fetchall()
        cursor.close()
        context['goals_completed'] = goals_completed
    except:
        print('DATABASE EROOR!')
    return render_template("dist/index.html", context = context)

@app.route('/rewards', methods = ['POST', 'GET'])
def rewards():
    context = dict()
    context['menu'] = "rewards"
    if (not session['user']):
        return render_template('dist/404.html')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT * FROM accounts WHERE id = ?', [session['user']['id']])
        user = cursor.fetchone()
        context['user'] = user[0]
        context['wallet'] = user[5]
        cursor.close()
    except:
        print('DATABASE EROOR! ')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT * FROM rewards WHERE accountID = ?', [session['user']['id']])
        rewards = cursor.fetchall()
        cursor.close()
        context['rewards'] = rewards
    except:
        print('DATABASE EROOR! ')
    return render_template("dist/rewards.html", context = context)

@app.route('/login', methods = ['POST', 'GET'])
def login():
    context = dict()
    context['menu'] = "login"
    return render_template("dist/login.html", context = context)

@app.route('/register', methods = ['POST', 'GET'])
def register():
    context = dict()
    context['menu'] = "register"
    return render_template("dist/register.html", context = context)

@app.route('/addGoal', methods = ['POST', 'GET'])
def add_goal():
    name = request.form.get('name')
    reward = request.form.get('reward')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('INSERT INTO Goals(name, status, reward, accountID) VALUES (?,?,?,?);', (name, 1, reward, session['user']['id']))
        cursor.execute('SELECT * FROM Goals ORDER BY goalId DESC LIMIT 1;')
        id = int(cursor.fetchone()[0])
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"id": id})

@app.route('/addReward', methods = ['POST', 'GET'])
def add_reward():
    name = request.form.get('name')
    cost = request.form.get('cost')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('INSERT INTO rewards(name, points, accountID) VALUES (?,?,?);', (name, cost, session['user']['id']))
        cursor.execute('SELECT * FROM rewards ORDER BY rewardId DESC LIMIT 1;')
        id = int(cursor.fetchone()[0])
        print(id)
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"id":id})

@app.route('/editGoal', methods = ['POST', 'GET'])
def edit_goal():
    name = request.form.get('newName')
    goal_id = request.form.get('goalID')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('UPDATE goals SET name = ? WHERE goalID = ?;', (name, goal_id))
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"pepega":"pepega"})

@app.route('/editReward', methods = ['POST', 'GET'])
def edit_reward():
    name = request.form.get('newName')
    reward_id = request.form.get('rewardID')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('UPDATE rewards SET name = ? WHERE rewardId = ?;', (name, reward_id))
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"pepega":"pepega"})

@app.route('/completeGoal', methods = ['POST', 'GET'])
def complete_goal():
    goal_id = request.form.get('goalID')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT reward FROM goals WHERE goalID = ?', (goal_id,))
        reward = cursor.fetchone()
        cursor.execute('SELECT wallet FROM accounts WHERE id = ?', [session['user']['id']])
        wallet = cursor.fetchone()
        wallet = wallet[0] + reward[0]
        cursor.execute('UPDATE accounts SET wallet = ? WHERE id = ?', (wallet, session['user']['id']))
        cursor.execute('UPDATE goals SET status = ? WHERE goalID = ?;', (2, goal_id))
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"wallet":wallet})

@app.route('/incompleteGoal', methods = ['POST', 'GET'])
def incomplete_goal():
    goal_id = request.form.get('goalID')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT reward FROM goals WHERE goalID = ?', (goal_id,))
        reward = cursor.fetchone()
        cursor.execute('SELECT wallet FROM accounts WHERE id = ?', [session['user']['id']])
        wallet = cursor.fetchone()
        wallet = wallet[0] - reward[0]
        if wallet < 0:
            return json.dumps({'success':False}), 405, {'ContentType':'application/json'}
        cursor.execute('UPDATE accounts SET wallet = ? WHERE id = ?', (wallet, session['user']['id']))
        cursor.execute('UPDATE goals SET status = ? WHERE goalID = ?;', (1, goal_id))
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"wallet":wallet})

@app.route('/useReward', methods = ['POST', 'GET'])
def use_reward():
    reward_id = request.form.get('rewardID')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT points FROM rewards WHERE rewardId = ?', (reward_id,))
        reward = cursor.fetchone()
        cursor.execute('SELECT wallet FROM accounts WHERE id = ?', [session['user']['id']])
        wallet = cursor.fetchone()
        wallet = wallet[0] - reward[0]
        if wallet < 0:
            return json.dumps({'success':False}), 405, {'ContentType':'application/json'}
        cursor.execute('UPDATE accounts SET wallet = ? WHERE id = ?', (wallet, session['user']['id']))
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"wallet":wallet})

@app.route('/deleteGoal', methods = ['POST', 'GET'])
def delete_goal():
    goal_id = request.form.get('goalID')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('DELETE FROM goals WHERE goalID =?', (goal_id,))
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"pepega":"pepega"})

@app.route('/deleteReward', methods = ['POST', 'GET'])
def delete_reward():
    reward_id = request.form.get('rewardID')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('DELETE FROM rewards WHERE rewardId =?', (reward_id,))
        db_connection.commit()
        cursor.close()
    except:
        print('DATABASE EROOR!')
    return json.dumps({"pepega":"pepega"})

@app.route('/addAccount', methods = ['POST', 'GET'])
def add_account():
    context = dict()
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        username = request.form.get('username')
        name = request.form.get('name')
        surname = request.form.get('surname')
        password = request.form.get('password')
        password_repeat = request.form.get('repeat_password')
        if password == request.form.get('repeat password'):
            cursor.execute('SELECT COUNT(*) FROM accounts;')
            id = int(cursor.fetchone()[0])+1
            session['user'] = {
                'id' : id,
                'login' : username,
                'name' : name
            }
            cursor.execute('INSERT INTO accounts (firstName, lastName, login, password, wallet) VALUES (?,?,?,?,?);', (name,surname,username,password,0))
            db_connection.commit()
            cursor.close()
            return redirect("/home")
        else:
            context['errors'] = True
            return redirect("/register")
    except:
        print('DATABASE EROOR!')
    return redirect("/home")

@app.route('/loginAccount', methods = ['POST', 'GET'])
def login_account():
    context = dict()
    username = request.form.get('username')
    password = request.form.get('password')
    try:
        db_connection = sqlite3.connect('rewardme.db')
        cursor = db_connection.cursor()
        cursor.execute('SELECT id, login, firstName FROM accounts WHERE login = ? AND password = ?;', [username,password])
        user = cursor.fetchone()
    except:
        user = None
        print('DATABASE EROOR!')
    if (user):
        session['user'] = {
        'id' : user[0],
        'login' : username,
        }
        return redirect("/home")
    else:
        context['error'] = True
        return redirect("/login")

@app.route('/exit', methods = ['POST', 'GET'])
def exit():
    context = dict()
    session['user'] = None
    return render_template('dist/register.html', context = context)

if __name__ == '__main__':

    app.run()
