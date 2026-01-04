
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { ServiceOrder, OrderStatus, ClientData, ServiceItem } from '../types';

interface OrderFormViewProps {
  initialData?: ServiceOrder | null;
  onSaved: () => void;
}

const OrderFormView: React.FC<OrderFormViewProps> = ({ initialData, onSaved }) => {
  const [client, setClient] = useState<ClientData>(initialData?.client || {
    name: '', cnpj: '', phone: '', address: '', email: ''
  });
  
  const [equipmentName, setEquipmentName] = useState(initialData?.equipmentName || '');
  const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '');
  const [entryDate, setEntryDate] = useState(initialData?.entryDate || new Date().toISOString().split('T')[0]);
  const [services, setServices] = useState<ServiceItem[]>(initialData?.services || []);
  const [status, setStatus] = useState<OrderStatus>(initialData?.status || OrderStatus.PENDING);
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceQty, setNewServiceQty] = useState(1);
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const calculateTotal = () => {
    return services.reduce((acc, s) => acc + (s.quantity * s.unitPrice), 0);
  };

  const addService = () => {
    if (!newServiceDesc) return;
    const item: ServiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newServiceDesc,
      quantity: newServiceQty,
      unitPrice: newServicePrice
    };
    setServices([...services, item]);
    setNewServiceDesc('');
    setNewServiceQty(1);
    setNewServicePrice(0);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleAiOptimize = async () => {
    if (!newServiceDesc) return;
    setIsAiLoading(true);
    const optimized = await geminiService.optimizeServiceDescription(newServiceDesc);
    setNewServiceDesc(optimized);
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (services.length === 0) {
      alert('Adicione pelo menos um serviço.');
      return;
    }

    const order: ServiceOrder = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      orderNumber: initialData?.orderNumber || `OS-${Math.floor(Math.random() * 90000) + 10000}`,
      client,
      equipmentName,
      serialNumber,
      entryDate,
      services,
      status,
      notes,
      totalValue: calculateTotal(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveOrder(order);
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Client & Equipment */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client Info Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="mr-2 text-blue-500">👤</span> Dados do Cliente
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome/Razão Social</label>
                <input
                  type="text"
                  required
                  value={client.name}
                  onChange={e => setClient({...client, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  required
                  value={client.cnpj}
                  onChange={e => setClient({...client, cnpj: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                <input
                  type="text"
                  required
                  value={client.phone}
                  onChange={e => setClient({...client, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                <textarea
                  required
                  value={client.address}
                  onChange={e => setClient({...client, address: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  rows={2}
                  placeholder="Rua, Número, Bairro, Cidade, Estado"
                />
              </div>
            </div>
          </div>

          {/* Equipment Info Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="mr-2 text-blue-500">💻</span> Informações do Equipamento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dados do Equipamento (Marca/Modelo)</label>
                <input
                  type="text"
                  required
                  value={equipmentName}
                  onChange={e => setEquipmentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Ex: Notebook Dell Vostro 5471"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número de Série</label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Ex: BR12345678"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Entrada</label>
                <input
                  type="date"
                  required
                  value={entryDate}
                  onChange={e => setEntryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="mr-2 text-blue-500">⚙️</span> Configurações da OS
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Atual</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {Object.values(OrderStatus).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações Internas</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  rows={3}
                  placeholder="Notas extras sobre o serviço..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Services & Values */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <span className="mr-2 text-blue-500">🛠️</span> Serviços a Realizar
            </h3>
            
            {/* Add Service Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Serviço</label>
                   <div className="flex gap-2">
                     <input
                      type="text"
                      placeholder="Ex: Formatação de computador e backup de arquivos"
                      value={newServiceDesc}
                      onChange={e => setNewServiceDesc(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAiOptimize}
                      disabled={isAiLoading || !newServiceDesc}
                      className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50 text-sm font-semibold flex items-center gap-1 shrink-0"
                      title="Otimizar descrição com IA"
                    >
                      {isAiLoading ? '...' : '✨ IA'}
                    </button>
                   </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-4">
                  <div className="w-full sm:w-24">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qtd</label>
                    <input
                      type="number"
                      value={newServiceQty}
                      onChange={e => setNewServiceQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                      min="1"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preço Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newServicePrice}
                      onChange={e => setNewServicePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="flex items-end w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={addService}
                      className="w-full h-[42px] px-6 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition font-semibold"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3 text-center">Qtd</th>
                    <th className="px-4 py-3 text-right">Unitário</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 group transition">
                      <td className="px-4 py-3 text-slate-700">{s.description}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{s.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600">R$ {s.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">R$ {(s.quantity * s.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeService(s.id)}
                          className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Nenhum serviço adicionado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Total Bar */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Valor Total da OS</p>
                <p className="text-3xl font-bold">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                 <button
                    type="button"
                    onClick={() => onSaved()}
                    className="flex-1 sm:flex-none px-6 py-2 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-8 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition font-bold shadow-lg shadow-blue-900/20"
                  >
                    Salvar Ordem
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default OrderFormView;
