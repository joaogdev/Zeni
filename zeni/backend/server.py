from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import asyncio
import secrets
import hashlib


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password: str  # Em produção, seria hasheada
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class PasswordResetToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token: str
    expires_at: datetime
    used: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    session_id: str
    user_id: str
    message: str

class WorkoutPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    category: str
    exercises: List[dict]
    duration: str
    difficulty: str
    created_by_ai: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# OpenAI API Key
OPENAI_API_KEY = "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"

# Routes originais
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Rotas de Autenticação
@api_router.post("/register")
async def register(user_data: UserCreate):
    # Verificar se o email já existe
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar novo usuário
    user = User(**user_data.dict())
    await db.users.insert_one(user.dict())
    
    return {"message": "Usuário criado com sucesso", "user_id": user.id, "name": user.name}

@api_router.post("/login")
async def login(login_data: UserLogin):
    # Buscar usuário
    user = await db.users.find_one({"email": login_data.email, "password": login_data.password})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    return {"message": "Login realizado com sucesso", "user_id": user["id"], "name": user["name"]}

# Rotas de Recuperação de Senha
@api_router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    # Verificar se o usuário existe
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Por segurança, não informamos se o email existe ou não
        return {"message": "Se o email estiver cadastrado, você receberá as instruções de recuperação"}
    
    # Gerar token de recuperação
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)  # Token válido por 1 hora
    
    # Salvar token no banco
    token_data = PasswordResetToken(
        user_id=user["id"],
        token=reset_token,
        expires_at=expires_at
    )
    await db.password_reset_tokens.insert_one(token_data.dict())
    
    # Em um ambiente real, você enviaria um email aqui
    # Para este demo, vamos retornar o link de reset
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    
    return {
        "message": "Se o email estiver cadastrado, você receberá as instruções de recuperação",
        "reset_link": reset_link,  # Em produção, isso seria enviado por email
        "demo_info": "Em um ambiente real, este link seria enviado por email"
    }

@api_router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    # Verificar se as senhas coincidem
    if request.new_password != request.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem")
    
    # Verificar se a senha tem pelo menos 6 caracteres
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 6 caracteres")
    
    # Buscar token válido
    token_data = await db.password_reset_tokens.find_one({
        "token": request.token,
        "used": False,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not token_data:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")
    
    # Atualizar senha do usuário
    await db.users.update_one(
        {"id": token_data["user_id"]},
        {"$set": {"password": request.new_password}}
    )
    
    # Marcar token como usado
    await db.password_reset_tokens.update_one(
        {"token": request.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Senha alterada com sucesso"}

@api_router.get("/verify-reset-token/{token}")
async def verify_reset_token(token: str):
    # Verificar se o token é válido
    token_data = await db.password_reset_tokens.find_one({
        "token": token,
        "used": False,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not token_data:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")
    
    return {"valid": True, "message": "Token válido"}

# Rotas do Chat de IA
@api_router.post("/chat")
async def chat_with_ai(chat_request: ChatRequest):
    try:
        # Importar aqui para evitar problemas de importação
        # TODO: Certifique-se de que o pacote 'emergentintegrations' está instalado e acessível no seu ambiente Python.
        raise HTTPException(status_code=503, detail="IA temporariamente indisponível - módulo de chat não encontrado")
        
        # Sistema de mensagem para a IA
        system_message = """Você é um personal trainer especializado em treinos em casa. 
        Ajude o usuário a criar planos de treino personalizados baseados em:
        - Nível de condicionamento físico
        - Objetivos (perder peso, ganhar massa, resistência, etc.)
        - Equipamentos disponíveis
        - Tempo disponível
        - Limitações físicas
        
        Forneça exercícios específicos com:
        - Nome do exercício
        - Número de séries
        - Número de repetições
        - Tempo de descanso
        - Instruções de execução
        - Dicas de segurança
        
        Seja motivador e educativo. Responda em português brasileiro."""
        
        # Verificar se a API key está configurada
        if not OPENAI_API_KEY or OPENAI_API_KEY == "":
            raise HTTPException(status_code=503, detail="IA temporariamente indisponível - API key não configurada")
        
        # Inicializar chat
        chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=chat_request.session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Criar mensagem do usuário
        user_message = UserMessage(text=chat_request.message)
        
        # Enviar mensagem e obter resposta
        response = await chat.send_message(user_message)
        
        # Salvar no banco de dados
        chat_message = ChatMessage(
            session_id=chat_request.session_id,
            user_id=chat_request.user_id,
            message=chat_request.message,
            response=response
        )
        await db.chat_messages.insert_one(chat_message.dict())
        
        return {"response": response, "session_id": chat_request.session_id}
        
    except ImportError as e:
        logger.error(f"Erro de importação: {str(e)}")
        raise HTTPException(status_code=503, detail="IA temporariamente indisponível - erro de configuração")
    except Exception as e:
        error_msg = str(e).lower()
        logger.error(f"Erro no chat: {str(e)}")
        
        # Verificar tipos específicos de erro
        if "authentication" in error_msg or "api key" in error_msg or "incorrect" in error_msg:
            raise HTTPException(status_code=503, detail="IA temporariamente indisponível - chave de API inválida")
        elif "quota" in error_msg or "limit" in error_msg:
            raise HTTPException(status_code=503, detail="IA temporariamente indisponível - limite de uso excedido")
        elif "network" in error_msg or "connection" in error_msg:
            raise HTTPException(status_code=503, detail="IA temporariamente indisponível - problemas de conexão")
        else:
            raise HTTPException(status_code=503, detail="IA temporariamente indisponível - tente novamente em alguns instantes")

# Buscar histórico de chat
@api_router.get("/chat/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(100)
    return messages

# Salvar plano de treino criado pela IA
@api_router.post("/workouts")
async def save_workout(workout: WorkoutPlan):
    await db.workouts.insert_one(workout.dict())
    return {"message": "Treino salvo com sucesso", "workout_id": workout.id}

# Buscar treinos do usuário
@api_router.get("/workouts/{user_id}")
async def get_user_workouts(user_id: str):
    workouts = await db.workouts.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return workouts

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
