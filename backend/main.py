from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from passlib.context import CryptContext
from db import execute_query

app = FastAPI()

# Configuração do CORS
origins = [
    "*", # Permitir todas as origens por enquanto, ajustar para o domínio do Vercel depois
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Schemas Pydantic ---

class UserCreate(BaseModel):
    nome: str
    email: str
    senha: str

class UserLogin(BaseModel):
    email: str
    senha: str

class User(BaseModel):
    id: int
    nome: str
    email: str

class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    categoria_id: int
    imagem_principal: str
    preco_ml: float
    link_ml: str
    preco_amazon: float
    link_amazon: str

class Produto(ProdutoBase):
    id: int

class AvaliacaoCreate(BaseModel):
    produto_id: int
    nota: int
    comentario: str

class Avaliacao(AvaliacaoCreate):
    id: int
    nome_usuario: str
    data_avaliacao: str

# --- Funções de Hash de Senha ---

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# --- Endpoints de Autenticação (Esqueleto) ---

@app.post("/auth/register", response_model=User)
def register_user(user: UserCreate):
    hashed_senha = hash_password(user.senha)
    query = "INSERT INTO usuarios (nome, email, senha_hash) VALUES (%s, %s, %s)"
    try:
        user_id = execute_query(query, (user.nome, user.email, hashed_senha))
        if user_id:
            return User(id=user_id, nome=user.nome, email=user.email)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao criar usuário")
    except Exception as e:
        if "Duplicate entry" in str(e) and "email" in str(e):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro no servidor: {e}")

@app.post("/auth/login")
def login_user(user_login: UserLogin):
    query = "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = %s"
    db_user = execute_query(query, (user_login.email,), fetch_one=True)

    if not db_user or not verify_password(user_login.senha, db_user["senha_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")

    # Retornar dados do usuário para o front-end, sem a senha_hash
    return {"message": "Login bem-sucedido", "user": User(id=db_user["id"], nome=db_user["nome"], email=db_user["email"])}

# --- Endpoints de Produtos (Esqueleto) ---

@app.get("/produtos", response_model=List[Produto])
def get_all_products():
    query = "SELECT id, nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon FROM produtos"
    produtos_db = execute_query(query)
    # Conversão de Decimal para float para o Pydantic
    for produto in produtos_db:
        produto["preco_ml"] = float(produto["preco_ml"])
        produto["preco_amazon"] = float(produto["preco_amazon"])
    return produtos_db

@app.get("/produtos/{produto_id}", response_model=Produto)
def get_product(produto_id: int):
    query = "SELECT id, nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon FROM produtos WHERE id = %s"
    produto_db = execute_query(query, (produto_id,), fetch_one=True)
    if not produto_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    
    produto_db["preco_ml"] = float(produto_db["preco_ml"])
    produto_db["preco_amazon"] = float(produto_db["preco_amazon"])
    return produto_db

# --- Endpoints de Avaliações (Esqueleto) ---

@app.post("/avaliacoes", status_code=status.HTTP_201_CREATED)
def create_avaliacao(avaliacao: AvaliacaoCreate, user_id: int = 1): # user_id fixo para teste, será alterado para Depends(get_current_user)
    # Simular obtenção do nome do usuário
    user_query = "SELECT nome FROM usuarios WHERE id = %s"
    user_data = execute_query(user_query, (user_id,), fetch_one=True)
    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    
    nome_usuario = user_data["nome"]

    query = "INSERT INTO avaliacoes (produto_id, usuario_id, nome_usuario, nota, comentario) VALUES (%s, %s, %s, %s, %s)"
    execute_query(query, (avaliacao.produto_id, user_id, nome_usuario, avaliacao.nota, avaliacao.comentario))
    return {"message": "Avaliação criada com sucesso"}

@app.get("/avaliacoes/{produto_id}", response_model=List[Avaliacao])
def get_avaliacoes(produto_id: int):
    query = "SELECT id, produto_id, nome_usuario, nota, comentario, data_avaliacao FROM avaliacoes WHERE produto_id = %s ORDER BY data_avaliacao DESC"
    avaliacoes_db = execute_query(query, (produto_id,))
    return avaliacoes_db

# --- Endpoints de Histórico (Esqueleto) ---

@app.post("/historico/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_to_historico(produto_id: int, user_id: int = 1): # user_id fixo para teste
    # Remove a entrada antiga (se existir) e insere a nova para manter a ordem de visualização
    delete_query = "DELETE FROM historico_visualizacao WHERE usuario_id = %s AND produto_id = %s"
    execute_query(delete_query, (user_id, produto_id))
    
    insert_query = "INSERT INTO historico_visualizacao (usuario_id, produto_id) VALUES (%s, %s)"
    execute_query(insert_query, (user_id, produto_id))
    return

@app.get("/historico", response_model=List[Produto])
def get_historico(user_id: int = 1): # user_id fixo para teste
    query = """
        SELECT p.id, p.nome, p.descricao, p.categoria_id, p.imagem_principal, p.preco_ml, p.link_ml, p.preco_amazon, p.link_amazon 
        FROM produtos p
        JOIN historico_visualizacao hv ON p.id = hv.produto_id
        WHERE hv.usuario_id = %s
        ORDER BY hv.data_visualizacao DESC
    """
    produtos_db = execute_query(query, (user_id,))
    for produto in produtos_db:
        produto["preco_ml"] = float(produto["preco_ml"])
        produto["preco_amazon"] = float(produto["preco_amazon"])
    return produtos_db

# --- Endpoint de Busca (Esqueleto) ---

@app.get("/produtos/search", response_model=List[Produto])
def search_products(q: str):
    search_term = f"%{q}%"
    query = """
        SELECT id, nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon 
        FROM produtos 
        WHERE nome LIKE %s OR descricao LIKE %s
    """
    produtos_db = execute_query(query, (search_term, search_term))
    for produto in produtos_db:
        produto["preco_ml"] = float(produto["preco_ml"])
        produto["preco_amazon"] = float(produto["preco_amazon"])
    return produtos_db

# --- Endpoint de Produtos Relacionados (Esqueleto) ---

@app.get("/produtos/related/{produto_id}", response_model=List[Produto])
def get_related_products(produto_id: int):
    # 1. Obter a categoria do produto principal
    category_query = "SELECT categoria_id FROM produtos WHERE id = %s"
    category_data = execute_query(category_query, (produto_id,), fetch_one=True)
    
    if not category_data:
        return [] # Produto não encontrado ou sem categoria

    categoria_id = category_data["categoria_id"]

    # 2. Obter outros produtos da mesma categoria, excluindo o produto principal
    related_query = """
        SELECT id, nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon 
        FROM produtos
        WHERE categoria_id = %s AND id != %s
        LIMIT 4 -- Limitar a 4 produtos relacionados
    """
    produtos_db = execute_query(related_query, (categoria_id, produto_id))
    for produto in produtos_db:
        produto["preco_ml"] = float(produto["preco_ml"])
        produto["preco_amazon"] = float(produto["preco_amazon"])
    return produtos_db

@app.get("/")
def read_root():
    return {"Hello": "Roxinho Shop API"}

