import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Componente Esqueceu a Senha
const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API}/forgot-password`, { email });
      setMessage(response.data.message);
      if (response.data.reset_link) {
        setResetLink(response.data.reset_link);
      }
    } catch (error) {
      setMessage('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const openResetLink = () => {
    window.open(resetLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h1>
          <p className="text-gray-400">Digite seu email para receber as instruções de recuperação</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Instruções'}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg text-sm">
            {message}
          </div>
        )}

        {resetLink && (
          <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
            <p className="text-sm mb-3">Para demonstração, o link de recuperação é:</p>
            <button
              onClick={openResetLink}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Abrir Link de Recuperação
            </button>
            <p className="text-xs mt-2 text-gray-400">Em um ambiente real, este link seria enviado por email</p>
          </div>
        )}

        <div className="text-center mt-6">
          <button onClick={onBack} className="text-purple-400 hover:text-purple-300 font-medium">
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Redefinir Senha
const ResetPassword = ({ token, onSuccess, onError }) => {
  const [formData, setFormData] = useState({ new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`${API}/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch (error) {
        setError('Token inválido ou expirado');
        onError('Token inválido ou expirado');
      } finally {
        setCheckingToken(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Token não fornecido');
      setCheckingToken(false);
    }
  }, [token, onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.new_password !== formData.confirm_password) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/reset-password`, {
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      onSuccess('Senha alterada com sucesso! Você pode fechar esta aba.');
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4"></div>
            <p className="text-white">Verificando token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Token Inválido</h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Redefinir Senha</h1>
          <p className="text-gray-400">Digite sua nova senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Nova Senha</label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({...formData, new_password: e.target.value})}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Digite sua nova senha"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Confirmar Nova Senha</label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Confirme sua nova senha"
              required
              minLength="6"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Componente para gerenciar a página de reset de senha
const ResetPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Extrair token da URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const handleSuccess = (message) => {
    setSuccess(true);
    setSuccessMessage(message);
  };

  const handleError = (message) => {
    setError(message);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sucesso!</h1>
          <p className="text-green-300">{successMessage}</p>
        </div>
      </div>
    );
  }

  return <ResetPassword token={token} onSuccess={handleSuccess} onError={handleError} />;
};

// Componente Login
const Login = ({ onLogin, onToggleMode, onForgotPassword }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/login`, formData);
      onLogin(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
          <p className="text-gray-400">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={onForgotPassword}
            className="text-purple-400 hover:text-purple-300 font-medium mb-4 block mx-auto"
          >
            Esqueceu a senha?
          </button>
          <p className="text-gray-400">
            Não tem uma conta?{' '}
            <button onClick={onToggleMode} className="text-purple-400 hover:text-purple-300 font-medium">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente Registro
const Register = ({ onRegister, onToggleMode }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/register`, formData);
      onRegister(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
          <p className="text-gray-400">Comece sua jornada fitness hoje</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Nome completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-gray-700/70 text-white p-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Já tem uma conta?{' '}
            <button onClick={onToggleMode} className="text-purple-400 hover:text-purple-300 font-medium">
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente Header
const Header = ({ userName, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-purple-900 to-violet-900 px-4 py-6 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Olá, {userName}!</h1>
            <p className="text-purple-200 text-sm">Pronto para treinar?</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

// Componente Citação Motivacional
const MotivationalQuote = () => {
  const motivationalQuotes = [
    "Seu único limite é você mesmo! 💪",
    "Cada treino te aproxima do seu objetivo! 🎯",
    "A consistência é a chave do sucesso! 🔑",
    "Transforme suor em conquista! 🏆",
    "Seu corpo pode fazer isso. É sua mente que você precisa convencer! 🧠",
    "Não pare quando estiver cansado, pare quando terminar! ⚡",
    "O progresso, não a perfeição! 📈"
  ];

  const [quote, setQuote] = useState(motivationalQuotes[6]);

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="mx-4 mb-8">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-2xl shadow-xl">
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-2">{quote}</p>
          <p className="text-white/80 text-sm">Dica motivacional do dia</p>
        </div>
      </div>
    </div>
  );
};

// Componente Chat com IA
const AIChat = ({ onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Date.now().toString());

  useEffect(() => {
    // Mensagem informativa sobre indisponibilidade temporária
    setMessages([{
      id: 1,
      type: 'ai',
      message: '🚧 **Personal Trainer IA Temporariamente Indisponível** 🚧\n\nOlá! Infelizmente nossa IA está temporariamente fora do ar para manutenção.\n\n**Enquanto isso, você pode:**\n• Usar a criação manual de treinos na tela anterior\n• Escolher exercícios específicos por categoria (Cardio, Força, HIIT, etc.)\n• Salvar seus treinos personalizados\n\n**Em breve estaremos de volta com:**\n• Treinos 100% personalizados\n• Sugestões baseadas em seus objetivos\n• Dicas de execução e segurança\n\nObrigado pela compreensão! 💪\n\n---\n\n*Volte para a tela anterior e crie seu treino manualmente por enquanto.*'
    }]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        user_id: user.user_id,
        message: inputMessage
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: response.data.response
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro no chat:', error);
      let errorMessage = 'Desculpe, a IA está temporariamente indisponível.';
      
      if (error.response?.status === 503) {
        errorMessage = error.response.data.detail || 'IA temporariamente indisponível para manutenção.';
      }
      
      const aiErrorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: `🚧 ${errorMessage}\n\nPor favor, use a criação manual de treinos por enquanto. Voltamos em breve! 💪`
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="px-4 h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Personal Trainer IA</h2>
            <p className="text-gray-400 text-sm">Temporariamente indisponível</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[calc(100vh-200px)]">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              message.type === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800/50 text-white border border-gray-700/50'
            }`}>
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 text-white border border-gray-700/50 p-4 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-gray-400">Verificando disponibilidade...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Desabilitado */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 opacity-50">
        <div className="flex space-x-2">
          <textarea
            value="IA temporariamente indisponível"
            placeholder="Chat temporariamente desabilitado..."
            className="flex-1 bg-transparent text-gray-500 placeholder-gray-500 resize-none outline-none max-h-20"
            rows="1"
            disabled
            readOnly
          />
          <button
            disabled
            className="bg-gray-600 text-gray-400 p-3 rounded-lg cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Use a criação manual na tela anterior</p>
      </div>
    </div>
  );
};

// Componente Ações Rápidas
const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      id: 'workout',
      title: 'Novo Treino',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      id: 'schedule',
      title: 'Agenda',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      id: 'health',
      title: 'Saúde',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-green-400 to-green-500'
    },
    {
      id: 'settings',
      title: 'Config',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-slate-600 to-slate-800'
    }
  ];

  return (
    <div className="px-4 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className="flex flex-col items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-gray-800/50 hover:bg-white/10"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-2 shadow-lg`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-white text-center">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente Card de Estatísticas
const StatsCard = ({ title, value, subtitle, icon, gradient = 'bg-gradient-to-r from-green-500 to-emerald-500' }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50 hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center shadow-lg`}> 
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          {subtitle && (
            <div className="text-sm text-gray-400">{subtitle}</div>
          )}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
};

// Componente Card de Treino
const WorkoutCard = ({ title, duration, exercises, difficulty, category, onStart, status = 'available' }) => {
  const statusColors = {
    'available': 'bg-green-500',
    'in-progress': 'bg-yellow-500',
    'completed': 'bg-gray-500'
  };

  const statusLabels = {
    'available': 'Fácil',
    'in-progress': 'Now',
    'completed': 'Difícil'
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400 mb-3">{category}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{exercises} exercícios</span>
            </div>
          </div>
        </div>
        <span className={`${statusColors[status]} text-white text-xs px-2 py-1 rounded-full font-medium`}>
          {statusLabels[status]}
        </span>
      </div>
      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
      >
        Iniciar Treino
      </button>
    </div>
  );
};

// Componente Novo Treino com IA
const NewWorkout = ({ onBack, onSaveWorkout, user }) => {
  const [showAI, setShowAI] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutCategory, setWorkoutCategory] = useState('');
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState({ name: '', reps: '', sets: '', rest: '' });

  // Exercícios organizados por categoria
  const exercisesByCategory = {
    'Cardio': [
      { name: 'Polichinelo', category: 'Cardio' },
      { name: 'Corrida Estacionária', category: 'Cardio' },
      { name: 'Mountain Climbers', category: 'Cardio' },
      { name: 'Burpee', category: 'Cardio' },
      { name: 'Jumping Jacks', category: 'Cardio' },
      { name: 'High Knees', category: 'Cardio' },
      { name: 'Skipping', category: 'Cardio' },
      { name: 'Shadow Boxing', category: 'Cardio' }
    ],
    'Força': [
      { name: 'Flexão de Braço', category: 'Força' },
      { name: 'Agachamento', category: 'Força' },
      { name: 'Lunges', category: 'Força' },
      { name: 'Prancha', category: 'Força' },
      { name: 'Flexão Diamante', category: 'Força' },
      { name: 'Agachamento Búlgaro', category: 'Força' },
      { name: 'Pike Push-ups', category: 'Força' },
      { name: 'Glute Bridge', category: 'Força' }
    ],
    'Flexibilidade': [
      { name: 'Alongamento de Panturrilha', category: 'Flexibilidade' },
      { name: 'Alongamento de Quadríceps', category: 'Flexibilidade' },
      { name: 'Alongamento de Ombros', category: 'Flexibilidade' },
      { name: 'Gato e Vaca', category: 'Flexibilidade' },
      { name: 'Torção Espinhal', category: 'Flexibilidade' },
      { name: 'Cão Olhando para Baixo', category: 'Flexibilidade' },
      { name: 'Alongamento do Psoas', category: 'Flexibilidade' },
      { name: 'Postura da Criança', category: 'Flexibilidade' }
    ],
    'HIIT': [
      { name: 'Burpee com Salto', category: 'HIIT' },
      { name: 'Squat Jump', category: 'HIIT' },
      { name: 'Mountain Climbers Rápidos', category: 'HIIT' },
      { name: 'Prancha com Knee-to-Elbow', category: 'HIIT' },
      { name: 'Jump Lunges', category: 'HIIT' },
      { name: 'Bear Crawl', category: 'HIIT' },
      { name: 'Tabata Squats', category: 'HIIT' },
      { name: 'Sprint no Lugar', category: 'HIIT' }
    ],
    'Funcional': [
      { name: 'Bear Crawl', category: 'Funcional' },
      { name: 'Crab Walk', category: 'Funcional' },
      { name: 'Turkish Get-up', category: 'Funcional' },
      { name: 'Farmer Walk', category: 'Funcional' },
      { name: 'Single Leg Deadlift', category: 'Funcional' },
      { name: 'Lateral Lunges', category: 'Funcional' },
      { name: 'Wood Choppers', category: 'Funcional' },
      { name: 'Crawling Patterns', category: 'Funcional' }
    ]
  };

  // Obter exercícios da categoria selecionada ou todos se não houver categoria
  const getCurrentExercises = () => {
    if (workoutCategory && exercisesByCategory[workoutCategory]) {
      return exercisesByCategory[workoutCategory];
    }
    // Se não há categoria, mostrar uma mistura de todos
    return [
      ...exercisesByCategory['Cardio'].slice(0, 2),
      ...exercisesByCategory['Força'].slice(0, 2),
      ...exercisesByCategory['HIIT'].slice(0, 2),
      ...exercisesByCategory['Funcional'].slice(0, 2)
    ];
  };

  const addExercise = () => {
    if (currentExercise.name && currentExercise.reps && currentExercise.sets) {
      setExercises([...exercises, { ...currentExercise, id: Date.now() }]);
      setCurrentExercise({ name: '', reps: '', sets: '', rest: '' });
    }
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const saveWorkout = () => {
    if (workoutName && exercises.length > 0) {
      const newWorkout = {
        id: Date.now(),
        title: workoutName,
        category: workoutCategory || 'Personalizado',
        exercises: exercises.length,
        duration: exercises.length * 3 + ' min',
        difficulty: 'Personalizado',
        exerciseList: exercises
      };
      onSaveWorkout(newWorkout);
      alert('Treino criado com sucesso!');
      onBack();
    } else {
      alert('Preencha o nome do treino e adicione pelo menos um exercício.');
    }
  };

  if (showAI) {
    return <AIChat onBack={() => setShowAI(false)} user={user} />;
  }

  return (
    <div className="px-4">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Criar Novo Treino</h2>
      </div>

      {/* Opção de IA */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">🤖 Personal Trainer IA</h3>
            <p className="text-purple-200 text-sm">Deixe nossa IA criar um treino personalizado para você!</p>
            <p className="text-purple-300 text-xs mt-1">⚠️ Funcionalidade temporariamente indisponível</p>
          </div>
          <button
            onClick={() => alert('IA temporariamente indisponível. Use a criação manual abaixo.')}
            className="bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold cursor-not-allowed opacity-50"
            disabled
          >
            Usar IA
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informações do Treino */}
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Informações do Treino</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Nome do Treino</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="Ex: Treino HIIT Personalizado"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Categoria</label>
              <select
                value={workoutCategory}
                onChange={(e) => setWorkoutCategory(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
              >
                <option value="">Selecione uma categoria</option>
                <option value="Cardio">Cardio</option>
                <option value="Força">Força</option>
                <option value="Flexibilidade">Flexibilidade</option>
                <option value="HIIT">HIIT</option>
                <option value="Funcional">Funcional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Adicionar Exercícios */}
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Adicionar Exercícios</h3>
          
          {/* Templates de Exercícios */}
          <div className="mb-4">
            <p className="text-white mb-2">
              Exercícios Sugeridos {workoutCategory && `para ${workoutCategory}`}:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {getCurrentExercises().map((template, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExercise({...currentExercise, name: template.name})}
                  className="bg-gray-700 text-white p-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
            {workoutCategory && (
              <p className="text-gray-400 text-xs mt-2">
                💡 Os exercícios sugeridos mudaram para a categoria "{workoutCategory}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2">Nome do Exercício</label>
              <input
                type="text"
                value={currentExercise.name}
                onChange={(e) => setCurrentExercise({...currentExercise, name: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="Nome do exercício"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Repetições</label>
              <input
                type="text"
                value={currentExercise.reps}
                onChange={(e) => setCurrentExercise({...currentExercise, reps: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="Ex: 10-15"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Séries</label>
              <input
                type="text"
                value={currentExercise.sets}
                onChange={(e) => setCurrentExercise({...currentExercise, sets: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="Ex: 3"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Descanso (seg)</label>
              <input
                type="text"
                value={currentExercise.rest}
                onChange={(e) => setCurrentExercise({...currentExercise, rest: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="Ex: 30"
              />
            </div>
          </div>

          <button
            onClick={addExercise}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 mb-4"
          >
            Adicionar Exercício
          </button>

          {/* Lista de Exercícios Adicionados */}
          {exercises.length > 0 && (
            <div>
              <h4 className="text-white mb-3">Exercícios do Treino ({exercises.length})</h4>
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                    <div className="text-white">
                      <p className="font-semibold">{exercise.name}</p>
                      <p className="text-sm text-gray-300">{exercise.sets} x {exercise.reps} - {exercise.rest}s descanso</p>
                    </div>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Salvar */}
        <button
          onClick={saveWorkout}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
        >
          Salvar Treino
        </button>
      </div>
    </div>
  );
};

// Componente Agenda/Calendário
const Schedule = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const toggleWorkoutDay = (day) => {
    const dateKey = `${selectedYear}-${selectedMonth}-${day}`;
    setWorkoutDays(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDayOfWeek = getFirstDayOfWeek(selectedMonth, selectedYear);
    const days = [];

    // Dias vazios no início
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${selectedMonth}-${day}`;
      const hasWorkout = workoutDays[dateKey];
      const isToday = day === new Date().getDate() && 
                    selectedMonth === new Date().getMonth() && 
                    selectedYear === new Date().getFullYear();

      days.push(
        <div key={day} className="p-1">
          <button
            onClick={() => toggleWorkoutDay(day)}
            className={`w-full h-12 rounded-lg text-sm font-medium transition-all duration-200 ${
              hasWorkout 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${
              isToday ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {day}
            {hasWorkout && (
              <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1"></div>
            )}
          </button>
        </div>
      );
    }

    return days;
  };

  const getWorkoutStats = () => {
    const currentMonthKey = `${selectedYear}-${selectedMonth}`;
    const workoutCount = Object.keys(workoutDays).filter(key => 
      key.startsWith(currentMonthKey) && workoutDays[key]
    ).length;
    
    return workoutCount;
  };

  return (
    <div className="px-4">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Agenda de Treinos</h2>
      </div>

      {/* Seletor de Mês/Ano */}
      <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
            className="text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-xl font-bold text-white">
            {months[selectedMonth]} {selectedYear}
          </h3>
          
          <button
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
            className="text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stats do Mês */}
        <div className="text-center mb-4">
          <p className="text-white">
            <span className="text-green-400 font-bold text-2xl">{getWorkoutStats()}</span>
            <span className="text-gray-300"> treinos realizados este mês</span>
          </p>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-gray-400 text-xs font-medium p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
        <h4 className="text-white font-semibold mb-3">Legenda</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300">Treino Realizado</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <span className="text-gray-300">Sem Treino</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-700 rounded ring-2 ring-purple-500"></div>
            <span className="text-gray-300">Hoje</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Toque em qualquer dia para marcar/desmarcar como dia de treino realizado.
        </p>
      </div>
    </div>
  );
};

// Componente Saúde
const Health = ({ onBack }) => {
  const [currentHealth, setCurrentHealth] = useState({
    weight: 73,
    height: 175,
    bodyFat: 18,
    muscle: 65,
    energy: 7,
    sleep: 7,
    stress: 4
  });

  const [futureGoals, setFutureGoals] = useState({
    targetWeight: 70,
    targetBodyFat: 12,
    targetMuscle: 70,
    timeFrame: 3
  });

  const [selectedTab, setSelectedTab] = useState('current');

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-400' };
    if (bmi < 25) return { category: 'Peso normal', color: 'text-green-400' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-400' };
    return { category: 'Obesidade', color: 'text-red-400' };
  };

  const currentBMI = calculateBMI(currentHealth.weight, currentHealth.height);
  const futureBMI = calculateBMI(futureGoals.targetWeight, currentHealth.height);
  const currentBMIInfo = getBMICategory(currentBMI);
  const futureBMIInfo = getBMICategory(futureBMI);

  return (
    <div className="px-4">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Saúde & Bem-estar</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-800/50 rounded-xl p-1 mb-6">
        <button
          onClick={() => setSelectedTab('current')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            selectedTab === 'current' 
              ? 'bg-green-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Estado Atual
        </button>
        <button
          onClick={() => setSelectedTab('goals')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            selectedTab === 'goals' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Metas Futuras
        </button>
      </div>

      {selectedTab === 'current' && (
        <div className="space-y-6">
          {/* Métricas Físicas Atuais */}
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Métricas Físicas Atuais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Peso (kg)</label>
                <input
                  type="number"
                  value={currentHealth.weight}
                  onChange={(e) => setCurrentHealth({...currentHealth, weight: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Altura (cm)</label>
                <input
                  type="number"
                  value={currentHealth.height}
                  onChange={(e) => setCurrentHealth({...currentHealth, height: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">% Gordura Corporal</label>
                <input
                  type="number"
                  value={currentHealth.bodyFat}
                  onChange={(e) => setCurrentHealth({...currentHealth, bodyFat: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Massa Muscular (kg)</label>
                <input
                  type="number"
                  value={currentHealth.muscle}
                  onChange={(e) => setCurrentHealth({...currentHealth, muscle: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* IMC Atual */}
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white">IMC Atual:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{currentBMI}</span>
                  <p className={`text-sm ${currentBMIInfo.color}`}>{currentBMIInfo.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bem-estar Atual */}
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Bem-estar Atual (1-10)</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white">Nível de Energia</label>
                  <span className="text-green-400 font-bold">{currentHealth.energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentHealth.energy}
                  onChange={(e) => setCurrentHealth({...currentHealth, energy: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white">Qualidade do Sono</label>
                  <span className="text-blue-400 font-bold">{currentHealth.sleep}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentHealth.sleep}
                  onChange={(e) => setCurrentHealth({...currentHealth, sleep: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white">Nível de Estresse</label>
                  <span className="text-red-400 font-bold">{currentHealth.stress}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentHealth.stress}
                  onChange={(e) => setCurrentHealth({...currentHealth, stress: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'goals' && (
        <div className="space-y-6">
          {/* Metas Físicas */}
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Metas Físicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Peso Meta (kg)</label>
                <input
                  type="number"
                  value={futureGoals.targetWeight}
                  onChange={(e) => setFutureGoals({...futureGoals, targetWeight: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">% Gordura Meta</label>
                <input
                  type="number"
                  value={futureGoals.targetBodyFat}
                  onChange={(e) => setFutureGoals({...futureGoals, targetBodyFat: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Massa Muscular Meta (kg)</label>
                <input
                  type="number"
                  value={futureGoals.targetMuscle}
                  onChange={(e) => setFutureGoals({...futureGoals, targetMuscle: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Prazo (meses)</label>
                <input
                  type="number"
                  value={futureGoals.timeFrame}
                  onChange={(e) => setFutureGoals({...futureGoals, timeFrame: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* IMC Meta */}
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white">IMC Meta:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{futureBMI}</span>
                  <p className={`text-sm ${futureBMIInfo.color}`}>{futureBMIInfo.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparativo */}
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Progresso Previsto</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-white">Perda de Peso:</span>
                <span className="text-green-400 font-bold">
                  {(currentHealth.weight - futureGoals.targetWeight).toFixed(1)}kg em {futureGoals.timeFrame} meses
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-white">Redução de Gordura:</span>
                <span className="text-blue-400 font-bold">
                  {(currentHealth.bodyFat - futureGoals.targetBodyFat).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-white">Ganho de Músculo:</span>
                <span className="text-purple-400 font-bold">
                  +{(futureGoals.targetMuscle - currentHealth.muscle).toFixed(1)}kg
                </span>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
            <h4 className="text-white font-bold mb-2">💡 Dicas para atingir suas metas:</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Mantenha consistência nos treinos (pelo menos 3x por semana)</li>
              <li>• Combine exercícios cardio com musculação</li>
              <li>• Acompanhe sua alimentação e hidratação</li>
              <li>• Durma pelo menos 7-8 horas por noite</li>
              <li>• Seja paciente - resultados duradouros levam tempo</li>
            </ul>
          </div>
        </div>
      )}

      {/* Botão Salvar */}
      <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 mt-6">
        Salvar Dados de Saúde
      </button>
    </div>
  );
};

// Componente Configurações
const Settings = ({ onBack }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    workoutReminders: true,
    weeklyGoals: true,
    soundEffects: true,
    darkMode: true,
    units: 'metric', // metric or imperial
    reminderTime: '07:00',
    weeklyGoal: 3,
    restDayReminder: true,
    motivationalQuotes: true
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = () => {
    // Aqui você salvaria as configurações
    alert('Configurações salvas com sucesso!');
  };

  const resetSettings = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações?')) {
      setSettings({
        notifications: true,
        workoutReminders: true,
        weeklyGoals: true,
        soundEffects: true,
        darkMode: true,
        units: 'metric',
        reminderTime: '07:00',
        weeklyGoal: 3,
        restDayReminder: true,
        motivationalQuotes: true
      });
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
      </div>

      <div className="space-y-6">
        {/* Notificações */}
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">🔔 Notificações</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Notificações Gerais</p>
                <p className="text-gray-400 text-sm">Receber notificações do app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Lembrete de Treino</p>
                <p className="text-gray-400 text-sm">Lembrar de fazer exercícios</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.workoutReminders}
                  onChange={(e) => handleSettingChange('workoutReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Metas Semanais</p>
                <p className="text-gray-400 text-sm">Notificar sobre progresso semanal</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyGoals}
                  onChange={(e) => handleSettingChange('weeklyGoals', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {settings.workoutReminders && (
              <div>
                <label className="block text-white mb-2">Horário do Lembrete</label>
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                  className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Preferências do App */}
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Preferências do App</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Efeitos Sonoros</p>
                <p className="text-gray-400 text-sm">Sons durante os treinos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Modo Escuro</p>
                <p className="text-gray-400 text-sm">Interface em modo escuro</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Frases Motivacionais</p>
                <p className="text-gray-400 text-sm">Mostrar citações diárias</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.motivationalQuotes}
                  onChange={(e) => handleSettingChange('motivationalQuotes', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-white mb-2">Sistema de Medidas</label>
              <select
                value={settings.units}
                onChange={(e) => handleSettingChange('units', e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
              >
                <option value="metric">Métrico (kg, cm)</option>
                <option value="imperial">Imperial (lbs, ft)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metas */}
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">🎯 Metas</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Meta Semanal de Treinos</label>
              <select
                value={settings.weeklyGoal}
                onChange={(e) => handleSettingChange('weeklyGoal', parseInt(e.target.value))}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
              >
                <option value={1}>1 treino por semana</option>
                <option value={2}>2 treinos por semana</option>
                <option value={3}>3 treinos por semana</option>
                <option value={4}>4 treinos por semana</option>
                <option value={5}>5 treinos por semana</option>
                <option value={6}>6 treinos por semana</option>
                <option value={7}>Todos os dias</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Lembrete de Descanso</p>
                <p className="text-gray-400 text-sm">Lembrar de dias de descanso</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.restDayReminder}
                  onChange={(e) => handleSettingChange('restDayReminder', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            onClick={saveSettings}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
          >
            Salvar Configurações
          </button>
          
          <button
            onClick={resetSettings}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Resetar Configurações
          </button>
        </div>

        {/* Informações do App */}
        <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">📱 Sobre o App</h3>
          <div className="space-y-2 text-gray-300">
            <p><span className="text-white font-medium">Versão:</span> 1.0.0</p>
            <p><span className="text-white font-medium">Desenvolvido por:</span> Home Gym Genius</p>
            <p><span className="text-white font-medium">Última atualização:</span> Hoje</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal do App
function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [userStats, setUserStats] = useState({
    weight: 73,
    weightChange: '-2kg esta semana',
    workouts: 12,
    workoutsThisWeek: 'Esta semana'
  });

  const [customWorkouts, setCustomWorkouts] = useState([]);

  // Verificar se é uma página de reset de senha
  const urlParams = new URLSearchParams(window.location.search);
  const isResetPage = urlParams.get('token') !== null;

  // Se for página de reset, mostrar apenas o componente de reset
  if (isResetPage) {
    return <ResetPasswordPage />;
  }

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('gymUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const defaultWorkouts = [
    {
      id: 1,
      title: 'Treino HIIT Iniciante',
      duration: '20 min',
      exercises: 8,
      difficulty: 'Fácil',
      category: 'Queima de Gordura',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Força para Membros Superiores',
      duration: '35 min',
      exercises: 12,
      difficulty: 'Médio',
      category: 'Ganho de Massa',
      status: 'available'
    },
    {
      id: 3,
      title: 'Treino de Resistência',
      duration: '40 min',
      exercises: 15,
      difficulty: 'Difícil',
      category: 'Condicionamento',
      status: 'completed'
    }
  ];

  const allWorkouts = [...defaultWorkouts, ...customWorkouts];

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gymUser', JSON.stringify(userData));
  };

  const handleRegister = (userData) => {
    setUser(userData);
    localStorage.setItem('gymUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gymUser');
    setCurrentView('home');
  };

  const handleActionClick = (actionId) => {
    setCurrentView(actionId);
  };

  const handleStartWorkout = (workoutId) => {
    alert(`Iniciando treino ${workoutId}!`);
  };

  const handleSaveWorkout = (newWorkout) => {
    setCustomWorkouts(prev => [...prev, newWorkout]);
  };

  // Se não estiver logado, mostrar tela de login/registro/forgot password
  if (!user) {
    if (showForgotPassword) {
      return (
        <ForgotPassword 
          onBack={() => setShowForgotPassword(false)}
        />
      );
    }
    
    return showLogin ? (
      <Login 
        onLogin={handleLogin} 
        onToggleMode={() => setShowLogin(false)}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    ) : (
      <Register 
        onRegister={handleRegister} 
        onToggleMode={() => setShowLogin(true)} 
      />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'workout':
        return (
          <NewWorkout 
            onBack={() => setCurrentView('home')} 
            onSaveWorkout={handleSaveWorkout}
            user={user}
          />
        );
      case 'schedule':
        return (
          <Schedule onBack={() => setCurrentView('home')} />
        );
      case 'health':
        return (
          <Health onBack={() => setCurrentView('home')} />
        );
      case 'settings':
        return (
          <Settings onBack={() => setCurrentView('home')} />
        );
      default:
        return (
          <>
            <MotivationalQuote />
            <QuickActions onActionClick={handleActionClick} />
            
            <div className="px-4 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Seu Progresso</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="PESO ATUAL"
                  value={`${userStats.weight}kg`}
                  subtitle={userStats.weightChange}
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  gradient="bg-gradient-to-r from-green-500 to-emerald-500"
                />
                <StatsCard
                  title="TREINOS"
                  value={userStats.workouts}
                  subtitle={userStats.workoutsThisWeek}
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                />
              </div>
            </div>

            <div className="px-4 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Treinos para Hoje</h2>
              {allWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  title={workout.title}
                  duration={workout.duration}
                  exercises={workout.exercises}
                  difficulty={workout.difficulty}
                  category={workout.category}
                  status={workout.status}
                  onStart={() => handleStartWorkout(workout.id)}
                />
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Header userName={user.name} onLogout={handleLogout} />
      <div className="pb-8">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;