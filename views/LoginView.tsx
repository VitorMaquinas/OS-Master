
import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      const users = storageService.getUsers();
      if (users.find((u: any) => u.username === username)) {
        setError('Este nome de usuário já existe.');
        return;
      }
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
        fullName
      };
      storageService.saveUser(newUser);
      onLogin({ id: newUser.id, username: newUser.username, fullName: newUser.fullName });
    } else {
      const users = storageService.getUsers();
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        onLogin({ id: user.id, username: user.username, fullName: user.fullName });
      } else {
        setError('Usuário ou senha inválidos.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="text-3xl font-bold">OS Master <span className="text-blue-200">Pro</span></h1>
          <p className="mt-2 text-blue-100 opacity-80 text-sm">Sistema Inteligente de Gestão de Ordens</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-800 text-center">
              {isRegistering ? 'Crie sua conta' : 'Acesse o sistema'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Ex: joao_silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-blue-200"
          >
            {isRegistering ? 'Registrar Agora' : 'Entrar no Sistema'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              {isRegistering ? 'Já tenho uma conta? Entrar' : 'Não tem conta? Registre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
