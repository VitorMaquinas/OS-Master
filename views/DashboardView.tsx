
import React, { useMemo } from 'react';
import { storageService } from '../services/storageService';
import { OrderStatus } from '../types';

interface DashboardViewProps {
  onNewOrder: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNewOrder }) => {
  const orders = storageService.getOrders();

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
      revenue: orders
        .filter(o => o.status === OrderStatus.COMPLETED)
        .reduce((acc, curr) => acc + curr.totalValue, 0)
    };
  }, [orders]);

  return (
    <div className="space-y-8">
      {/* Welcome & Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Acompanhe o desempenho do seu negócio em tempo real.</p>
        </div>
        <button
          onClick={onNewOrder}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center shadow-lg shadow-blue-100"
        >
          <span className="mr-2 text-xl">+</span> Abrir Nova OS
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total de OS</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span> Cadastradas no sistema
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
          <div className="mt-4 flex items-center text-xs font-medium text-amber-600">
             Aguardando execução
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Concluídas</p>
          <p className="text-3xl font-bold text-emerald-500">{stats.completed}</p>
          <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
             Trabalho finalizado
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Faturamento (OS Concluídas)</p>
          <p className="text-2xl font-bold text-blue-600">R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="mt-4 flex items-center text-xs font-medium text-blue-600">
             Dinheiro em caixa
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Atividades Recentes</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(-5).reverse().map(order => (
            <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                  ${order.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                    order.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                  #{order.orderNumber.split('-')[1]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{order.client.name}</p>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider
                   ${order.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                    order.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              Nenhuma atividade registrada ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
