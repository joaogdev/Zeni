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
from mysql_client import mysql_client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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

# Helper functions for MySQL operations
def convert_datetime_to_string(obj):
    """Convert datetime objects to ISO format strings for MySQL"""
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
    
    # Convert datetime for MySQL
    status_data = convert_datetime_to_string(status_obj.dict())
    
    try:
        mysql_client.insert_one('status_checks', status_data)
        return status_obj
    except Exception as e:
        logging.error(f"Error creating status check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    try:
        data = mysql_client.find_all('status_checks')
        return [StatusCheck(**item) for item in data]
    except Exception as e:
        logging.error(f"Error getting status checks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Rotas de Autenticação
@api_router.post("/register")
async def register(user_data: UserCreate):
    try:
        # Verificar se o email já existe
        existing_user = mysql_client.find_one('users', {'email': user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        # Criar novo usuário
        user = User(**user_data.dict())
        user_data_dict = convert_datetime_to_string(user.dict())
        
        mysql_client.insert_one('users', user_data_dict)
        return {"message": "Usuário criado com sucesso", "user_id": user.id, "name": user.name}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.post("/login")
async def login(login_data: UserLogin):
    try:
        # Buscar usuário
        user = mysql_client.find_one('users', {'email': login_data.email, 'password': login_data.password})
        if not user:
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
        return {"message": "Login realizado com sucesso", "user_id": user['id'], "name": user['name']}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error logging in: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    try:
        # Verificar se o usuário existe
        user = mysql_client.find_one('users', {'email': request.email})
        if not user:
            # Por segurança, não informamos se o email existe ou não
            return {"message": "Se o email estiver cadastrado, você receberá um link de recuperação"}
        
        # Gerar token de recuperação
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        token_data = PasswordResetToken(
            user_id=user['id'],
            token=reset_token,
            expires_at=expires_at
        )
        
        token_data_dict = convert_datetime_to_string(token_data.dict())
        mysql_client.insert_one('password_reset_tokens', token_data_dict)
        
        # Em produção, aqui você enviaria o email
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        
        return {
            "message": "Se o email estiver cadastrado, você receberá um link de recuperação",
            "reset_link": reset_link  # Apenas para demonstração
        }
        
    except Exception as e:
        logging.error(f"Error processing forgot password: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="As senhas não coincidem")
        
        # Buscar token válido
        current_time = datetime.utcnow()
        token = mysql_client.find_one('password_reset_tokens', {'token': request.token, 'used': False})
        
        if not token:
            raise HTTPException(status_code=400, detail="Token inválido ou expirado")
        
        # Verificar se o token não expirou
        expires_at = token['expires_at']
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        if expires_at < current_time:
            raise HTTPException(status_code=400, detail="Token expirado")
        
        # Atualizar senha do usuário
        mysql_client.update_one('users', {'id': token['user_id']}, {'password': request.new_password})
        
        # Marcar token como usado
        mysql_client.update_one('password_reset_tokens', {'token': request.token}, {'used': True})
        
        return {"message": "Senha alterada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/validate-reset-token/{token}")
async def validate_reset_token(token: str):
    try:
        # Verificar se o token é válido
        current_time = datetime.utcnow()
        token_data = mysql_client.find_one('password_reset_tokens', {'token': token, 'used': False})
        
        if not token_data:
            raise HTTPException(status_code=400, detail="Token inválido")
        
        # Verificar se o token não expirou
        if datetime.fromisoformat(token_data['expires_at'].replace('Z', '+00:00')) < current_time:
            raise HTTPException(status_code=400, detail="Token expirado")
        
        return {"message": "Token válido"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error validating reset token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Rotas de Chat com IA
@api_router.post("/chat")
async def chat_with_ai(chat_request: ChatRequest):
    try:
        # Aqui você integraria com a OpenAI API
        # Por enquanto, vamos simular uma resposta
        response = f"Resposta da IA para: {chat_request.message}"
        
        # Salvar no banco de dados
        chat_message = ChatMessage(
            session_id=chat_request.session_id,
            user_id=chat_request.user_id,
            message=chat_request.message,
            response=response
        )
        
        chat_data = convert_datetime_to_string(chat_message.dict())
        mysql_client.insert_one('chat_messages', chat_data)
        
        return {"response": response, "session_id": chat_request.session_id}
        
    except Exception as e:
        logging.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/chat/{session_id}")
async def get_chat_history(session_id: str):
    try:
        data = mysql_client.find_all('chat_messages', {'session_id': session_id})
        return data
    except Exception as e:
        logging.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.post("/workouts")
async def save_workout(workout: WorkoutPlan):
    try:
        workout_data = convert_datetime_to_string(workout.dict())
        mysql_client.insert_one('workouts', workout_data)
        return {"message": "Treino salvo com sucesso", "workout_id": workout.id}
    except Exception as e:
        logging.error(f"Error saving workout: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@api_router.get("/workouts/{user_id}")
async def get_user_workouts(user_id: str):
    try:
        data = mysql_client.find_all('workouts', {'user_id': user_id})
        return data
    except Exception as e:
        logging.error(f"Error getting user workouts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)