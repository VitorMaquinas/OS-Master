
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { ServiceOrder, OrderStatus, CompanySettings } from '../types';

interface OrderListViewProps {
  onEdit: (order: ServiceOrder) => void;
}

const OrderListView: React.FC<OrderListViewProps> = ({ onEdit }) => {
  const [orders, setOrders] = useState<ServiceOrder[]>(storageService.getOrders());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [printingOrder, setPrintingOrder] = useState<ServiceOrder | null>(null);

  const companySettings = storageService.getSettings();

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.client.name.toLowerCase().includes(search.toLowerCase()) || 
                          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          (o.equipmentName && o.equipmentName.toLowerCase().includes(search.toLowerCase())) ||
                          o.client.cnpj.includes(search);
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, filterStatus]);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      storageService.deleteOrder(id);
      setOrders(storageService.getOrders());
    }
  };

  const handlePrint = (order: ServiceOrder) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 100);
  };

  // Componente de Impressão (invisível na tela, visível no print)
  const PrintTemplate = ({ order, via }: { order: ServiceOrder; via: string }) => (
    <div className="p-8 border-2 border-slate-200 rounded-xl mb-12 h-[14cm] relative text-slate-800">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          {companySettings.logo && (
            <img src={companySettings.logo} alt="Logo" className="w-16 h-16 object-contain" />
          )}
          <div>
            <h2 className="text-xl font-bold uppercase">{companySettings.name}</h2>
            <p className="text-xs text-slate-500 italic">Ordem de Serviço - {via}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">OS #{order.orderNumber.split('-')[1]}</p>
          <p className="text-[10px]">Entrada: {new Date(order.entryDate).toLocaleDateString('pt-BR')}</p>
          <p className="text-[10px]">Registro: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
        <div className="p-2 bg-slate-50 rounded">
          <p className="font-bold border-b mb-1 uppercase text-[10px]">Dados do Cliente</p>
          <p><strong>Nome:</strong> {order.client.name}</p>
          <p><strong>CNPJ/CPF:</strong> {order.client.cnpj}</p>
          <p><strong>Tel:</strong> {order.client.phone}</p>
          <p><strong>End:</strong> {order.client.address}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded">
          <p className="font-bold border-b mb-1 uppercase text-[10px]">Equipamento</p>
          <p><strong>Modelo:</strong> {order.equipmentName}</p>
          <p><strong>S/N:</strong> {order.serialNumber}</p>
          <p><strong>Entrada:</strong> {new Date(order.entryDate).toLocaleDateString('pt-BR')}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full text-[10px] text-left">
          <thead className="bg-slate-100 uppercase font-bold">
            <tr>
              <th className="px-2 py-1">Serviço</th>
              <th className="px-2 py-1 text-center">Qtd</th>
              <th className="px-2 py-1 text-right">Unitário</th>
              <th className="px-2 py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.services.map(s => (
              <tr key={s.id}>
                <td className="px-2 py-1">{s.description}</td>
                <td className="px-2 py-1 text-center">{s.quantity}</td>
                <td className="px-2 py-1 text-right">R$ {s.unitPrice.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">R$ {(s.quantity * s.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="absolute bottom-8 right-8 text-right">
        <p className="text-lg font-bold">TOTAL: R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="absolute bottom-8 left-8 flex space-x-12">
        <div className="border-t border-slate-800 w-32 text-center mt-8">
          <p className="text-[8px] uppercase">Assinatura Cliente</p>
        </div>
        <div className="border-t border-slate-800 w-32 text-center mt-8">
          <p className="text-[8px] uppercase">Assinatura Empresa</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Área de Impressão - Só visível via window.print() */}
      {printingOrder && (
        <div className="hidden print:block absolute inset-0 bg-white z-[9999]">
          <PrintTemplate order={printingOrder} via="Via do Cliente" />
          <div className="border-b-2 border-dashed border-slate-300 my-4 flex items-center justify-center">
            <span className="bg-white px-2 text-[8px] text-slate-400 font-mono">tesoura aqui</span>
          </div>
          <PrintTemplate order={printingOrder} via="Via da Empresa" />
        </div>
      )}

      {/* View Normal (Listagem) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar por cliente, equipamento, CNPJ ou número da OS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
        >
          <option value="all">Todos os Status</option>
          {Object.values(OrderStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">OS / Entrada</th>
                <th className="px-6 py-4">Cliente / CNPJ</th>
                <th className="px-6 py-4">Equipamento / S/N</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor Total</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">#{order.orderNumber.split('-')[1]}</div>
                    <div className="text-xs text-slate-400">Entrada: {new Date(order.entryDate).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{order.client.name}</div>
                    <div className="text-xs text-slate-400">{order.client.cnpj}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 truncate max-w-[150px]" title={order.equipmentName}>
                      {order.equipmentName || '---'}
                    </div>
                    <div className="text-xs text-slate-400">
                      SN: {order.serialNumber || '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest
                      ${order.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                        order.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-700' : 
                        order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handlePrint(order)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Imprimir OS"
                      >
                        🖨️
                      </button>
                      <button
                        onClick={() => onEdit(order)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderListView;
