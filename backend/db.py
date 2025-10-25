import os
from dotenv import load_dotenv
import pymysql.cursors

# Carregar variáveis de ambiente
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def get_db_connection():
    """Cria e retorna uma conexão com o banco de dados."""
    return pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        port=int(os.getenv('DB_PORT')),
        cursorclass=pymysql.cursors.DictCursor
    )

def execute_query(query, params=None, fetch_one=False):
    """Executa uma query e retorna os resultados."""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                conn.commit()
                return cursor.lastrowid if query.strip().upper().startswith('INSERT') else cursor.rowcount
            else:
                if fetch_one:
                    return cursor.fetchone()
                else:
                    return cursor.fetchall()
    except Exception as e:
        print(f"Erro ao executar query: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

# Exemplo de uso (para testes)
if __name__ == '__main__':
    try:
        # Teste de conexão
        conn = get_db_connection()
        print("Conexão com o banco de dados bem-sucedida!")
        conn.close()

        # Teste de query
        usuarios = execute_query("SELECT * FROM usuarios LIMIT 1")
        print("Usuários (teste):", usuarios)
    except Exception as e:
        print(f"Falha no teste de conexão/query: {e}")

