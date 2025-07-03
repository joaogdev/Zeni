from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import secrets
import hashlib
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

# Helper functions for Supabase operations
def convert_datetime_to_string(obj):
    """Convert datetime objects to ISO format strings for Supabase"""
    if isinstance(obj, dict):
        return {key: convert_datetime_to_string(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_datetime_to_string(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj

# Routes originais
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    
    # Convert datetime for Supabase
    status_data = convert_datetime_to_string(status_obj.dict())
    
    try:
        response = supabase.table('status_checks').insert(status_data).execute()
        if response.data:
            return status_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to create status check")
    except Exception as e:
        logging.error(f"Error creating status check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    try:
        response = supabase.table('status_checks').select("*").execute()
        if response.data:
            return [StatusCheck(**item) for item in response.data]
        return []
    except Exception as e:
        logging.error(f"Error getting status checks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Rotas de Autenticação
@api_router.post("/register")
async def register(user_data: UserCreate):
    try:
        # Verificar se o email já existe
        existing_user_response = supabase.table('users').select("*").eq('email', user_data.email).execute()
        if existing_user_response.data:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        # Criar novo usuário
        user = User(**user_data.dict())
        user_data_dict = convert_datetime_to_string(user.dict())
        
        response = supabase.table('users').insert(user_data_dict).execute()
        if response.data:
            return {"message": "Usuário criado com sucesso", "user_id": user.id, "name": user.name}
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.post("/login")
async def login(login_data: UserLogin):
    try:
        # Buscar usuário
        response = supabase.table('users').select("*").eq('email', login_data.email).eq('password', login_data.password).execute()
        if not response.data:
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
        user = response.data[0]
        return {"message": "Login realizado com sucesso", "user_id": user["id"], "name": user["name"]}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Rotas de Recuperação de Senha
@api_router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    try:
        # Verificar se o usuário existe
        user_response = supabase.table('users').select("*").eq('email', request.email).execute()
        if not user_response.data:
            # Por segurança, não informamos se o email existe ou não
            return {"message": "Se o email estiver cadastrado, você receberá as instruções de recuperação"}
        
        user = user_response.data[0]
        
        # Gerar token de recuperação
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)  # Token válido por 1 hora
        
        # Salvar token no banco
        token_data = PasswordResetToken(
            user_id=user["id"],
            token=reset_token,
            expires_at=expires_at
        )
        
        token_data_dict = convert_datetime_to_string(token_data.dict())
        response = supabase.table('password_reset_tokens').insert(token_data_dict).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create reset token")
        
        # Em um ambiente real, você enviaria um email aqui
        # Para este demo, vamos retornar o link de reset
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        
        return {
            "message": "Se o email estiver cadastrado, você receberá as instruções de recuperação",
            "reset_link": reset_link,  # Em produção, isso seria enviado por email
            "demo_info": "Em um ambiente real, este link seria enviado por email"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in forgot password: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        # Verificar se as senhas coincidem
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="As senhas não coincidem")
        
        # Verificar se a senha tem pelo menos 6 caracteres
        if len(request.new_password) < 6:
            raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 6 caracteres")
        
        # Buscar token válido
        current_time = datetime.utcnow().isoformat()
        token_response = supabase.table('password_reset_tokens').select("*").eq('token', request.token).eq('used', False).gt('expires_at', current_time).execute()
        
        if not token_response.data:
            raise HTTPException(status_code=400, detail="Token inválido ou expirado")
        
        token_data = token_response.data[0]
        
        # Atualizar senha do usuário
        user_update_response = supabase.table('users').update({"password": request.new_password}).eq('id', token_data["user_id"]).execute()
        
        if not user_update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update password")
        
        # Marcar token como usado
        token_update_response = supabase.table('password_reset_tokens').update({"used": True}).eq('token', request.token).execute()
        
        return {"message": "Senha alterada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/verify-reset-token/{token}")
async def verify_reset_token(token: str):
    try:
        # Verificar se o token é válido
        current_time = datetime.utcnow().isoformat()
        token_response = supabase.table('password_reset_tokens').select("*").eq('token', token).eq('used', False).gt('expires_at', current_time).execute()
        
        if not token_response.data:
            raise HTTPException(status_code=400, detail="Token inválido ou expirado")
        
        return {"valid": True, "message": "Token válido"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error verifying token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Rotas do Chat de IA
@api_router.post("/chat")
async def chat_with_ai(chat_request: ChatRequest):
    try:
        # Importar aqui para evitar problemas de importação
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
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
        
        # Salvar no banco de dados Supabase
        chat_message = ChatMessage(
            session_id=chat_request.session_id,
            user_id=chat_request.user_id,
            message=chat_request.message,
            response=response
        )
        
        chat_data = convert_datetime_to_string(chat_message.dict())
        supabase_response = supabase.table('chat_messages').insert(chat_data).execute()
        
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
    try:
        response = supabase.table('chat_messages').select("*").eq('session_id', session_id).order('timestamp').execute()
        return response.data if response.data else []
    except Exception as e:
        logging.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Salvar plano de treino criado pela IA
@api_router.post("/workouts")
async def save_workout(workout: WorkoutPlan):
    try:
        workout_data = convert_datetime_to_string(workout.dict())
        response = supabase.table('workouts').insert(workout_data).execute()
        if response.data:
            return {"message": "Treino salvo com sucesso", "workout_id": workout.id}
        else:
            raise HTTPException(status_code=500, detail="Failed to save workout")
    except Exception as e:
        logging.error(f"Error saving workout: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Buscar treinos do usuário
@api_router.get("/workouts/{user_id}")
async def get_user_workouts(user_id: str):
    try:
        response = supabase.table('workouts').select("*").eq('user_id', user_id).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        logging.error(f"Error getting user workouts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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