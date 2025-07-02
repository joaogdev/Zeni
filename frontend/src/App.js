import React, { useState, useEffect } from 'react';
import './App.css';

// Componente Header
const Header = ({ userName = "João Guilherme" }) => {
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
        <button className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
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

  const [quote, setQuote] = useState(motivationalQuotes[6]); // "O progresso, não a perfeição!"

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
  const difficultyColors = {
    'Fácil': 'bg-green-500',
    'Médio': 'bg-yellow-500',
    'Difícil': 'bg-red-500'
  };

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

// Componente Principal do App
function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userStats, setUserStats] = useState({
    weight: 73,
    weightChange: '-2kg esta semana',
    workouts: 12,
    workoutsThisWeek: 'Esta semana'
  });

  const workouts = [
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

  const handleActionClick = (actionId) => {
    console.log(`Ação clicada: ${actionId}`);
    setCurrentView(actionId);
  };

  const handleStartWorkout = (workoutId) => {
    console.log(`Iniciando treino: ${workoutId}`);
    alert(`Iniciando treino ${workoutId}!`);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'workout':
        return (
          <div className="px-4">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setCurrentView('home')} 
                className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white">Novo Treino</h2>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <p className="text-white text-center">Funcionalidade de Novo Treino em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="px-4">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setCurrentView('home')} 
                className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white">Agenda</h2>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <p className="text-white text-center">Funcionalidade de Agenda em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'health':
        return (
          <div className="px-4">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setCurrentView('home')} 
                className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white">Saúde</h2>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <p className="text-white text-center">Funcionalidade de Saúde em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="px-4">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setCurrentView('home')} 
                className="text-white mr-4 hover:bg-white/10 p-2 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white">Configurações</h2>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <p className="text-white text-center">Funcionalidade de Configurações em desenvolvimento...</p>
            </div>
          </div>
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
              {workouts.map((workout) => (
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
      <Header userName="João Guilherme" />
      <div className="pb-8">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;