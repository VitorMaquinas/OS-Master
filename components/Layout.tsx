
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeTab: 'dashboard' | 'orders' | 'new' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'orders' | 'new' | 'settings') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-slate-50 print:bg-white">
      {/* Sidebar - Oculta na impressão */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex print:hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">OS Master <span className="text-white">Pro</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span className="mr-3">📊</span> Painel Principal
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span className="mr-3">📋</span> Ordens de Serviço
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${activeTab === 'new' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span className="mr-3">➕</span> Nova OS
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span className="mr-3">⚙️</span> Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-4 flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <span className="mr-3">🚪</span> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto print:overflow-visible print:bg-white">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 print:hidden">
          <h2 className="text-xl font-semibold text-slate-800">
            {activeTab === 'dashboard' ? 'Dashboard' : 
             activeTab === 'orders' ? 'Ordens de Serviço' : 
             activeTab === 'settings' ? 'Configurações da Empresa' : 'Nova Ordem de Serviço'}
          </h2>
          <div className="md:hidden flex items-center space-x-4">
             <button onClick={onLogout} className="text-sm font-medium text-red-600">Sair</button>
          </div>
        </header>
        
        <div className="p-8 max-w-7xl mx-auto print:p-0 print:max-w-none">
          {children}
        </div>
        
        {/* Mobile Navigation - Oculta na impressão */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 print:hidden">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'}`}>
            <span className="text-xl">📊</span>
            <span className="text-[10px]">Início</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center p-2 ${activeTab === 'orders' ? 'text-blue-600' : 'text-slate-500'}`}>
            <span className="text-xl">📋</span>
            <span className="text-[10px]">Ordens</span>
          </button>
          <button onClick={() => setActiveTab('new')} className={`flex flex-col items-center p-2 ${activeTab === 'new' ? 'text-blue-600' : 'text-slate-500'}`}>
            <span className="text-xl">➕</span>
            <span className="text-[10px]">Nova</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-500'}`}>
            <span className="text-xl">⚙️</span>
            <span className="text-[10px]">Ajustes</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
