from flask import Flask, request
from flask_cors import CORS
import sqlite3
import requests

banco = sqlite3.connect("HTMLStudio_dados.db", check_same_thread=False)
cursor = banco.cursor()

cursor.execute("""CREATE TABLE IF NOT EXISTS Users_Dados 
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
               nome varchar(100),
               email TEXT,
               senha TEXT)""")

print('Parei aqui!')
app = Flask(__name__)
CORS(app)
@app.route("/dados", methods=["POST"])
def api_info():
    url = "https://commute-doormat-operator.ngrok-free.dev/dados"
    resposta = requests.get(url)
    print(resposta.status_code)

    print("Recebendo Dados!")
    info = request.get_json()
    print(info)
    nome = info.get("nome")
    email = info.get("email")
    senha = info.get("senha")

    try: 
        cursor.execute("INSERT INTO Users_Dados (nome, email, senha) VALUES (?, ?, ?)", (nome, email, senha))
        banco.commit()        
    except sqlite3.OperationalError:
        return{'mensagem': 'Erro no Banco de Dados...'}
    
    return {'mensagem_cadastro': 'Dados recebidos!'}
    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)