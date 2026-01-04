
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { CompanySettings } from '../types';

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [syncId, setSyncId] = useState<string>(storageService.getSyncId());
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    storageService.saveSettings(settings);
    setSaveStatus('Configurações salvas com sucesso!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleGenerateId = () => {
    const newId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setSyncId(newId);
    storageService.setSyncId(newId);
  };

  const handlePush = async () => {
    if (!syncId) return alert('Gere ou insira um código de sincronização primeiro.');
    setIsSyncing(true);
    const success = await storageService.pushToCloud(syncId);
    setIsSyncing(false);
    setSyncStatus(success ? 'Dados enviados com sucesso!' : 'Erro ao enviar dados.');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handlePull = async () => {
    if (!syncId) return alert('Insira o código de sincronização.');
    if (!confirm('Isso irá substituir TODOS os dados deste computador pelos dados da nuvem. Deseja continuar?')) return;
    
    setIsSyncing(true);
    const success = await storageService.pullFromCloud(syncId);
    setIsSyncing(false);
    if (success) {
      alert('Dados sincronizados! O sistema irá reiniciar.');
      window.location.reload();
    } else {
      setSyncStatus('Erro ao baixar dados. Verifique o código.');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const handleExport = () => {
    const data = storageService.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_os_master_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          storageService.importAllData(data);
          alert('Backup importado com sucesso! O sistema irá reiniciar.');
          window.location.reload();
        } catch (err) {
          alert('Arquivo de backup inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Coluna Esquerda: Dados da Empresa */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <span className="mr-2 text-blue-500">🏢</span> Dados da Empresa
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Fantasia / Razão Social</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Assistência Técnica Express"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Logotipo da Empresa</label>
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-slate-400 text-xs text-center p-2">Sem Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer transition font-medium"
                  >
                    Selecionar
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition font-bold"
            >
              Salvar Dados da Empresa
            </button>
            {saveStatus && <p className="text-emerald-600 text-center font-medium text-sm">{saveStatus}</p>}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="mr-2 text-amber-500">💾</span> Backup Manual
          </h3>
          <p className="text-xs text-slate-500 mb-6">Baixe um arquivo com todos os seus dados para segurança extra.</p>
          <div className="flex gap-4">
            <button
              onClick={handleExport}
              className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-semibold text-sm"
            >
              Exportar JSON
            </button>
            <label className="flex-1">
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              <span className="flex items-center justify-center w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-semibold text-sm cursor-pointer">
                Importar JSON
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Sincronização em Nuvem */}
      <div className="space-y-6">
        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl">☁️</span>
          </div>
          
          <h3 className="text-xl font-bold mb-2 flex items-center relative z-10">
            <span className="mr-2">🔄</span> Sincronização em Nuvem
          </h3>
          <p className="text-indigo-200 text-sm mb-8 relative z-10">
            Use esta função para transferir dados entre computadores. 
            Gere um código no PC principal e use o mesmo código no PC secundário.
          </p>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Código de Sincronização</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={syncId}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setSyncId(val);
                    storageService.setSyncId(val);
                  }}
                  className="flex-1 bg-indigo-800/50 border border-indigo-700 rounded-lg px-4 py-2 font-mono tracking-widest outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="EX: A1B2C3D4"
                />
                <button
                  onClick={handleGenerateId}
                  className="bg-indigo-700 hover:bg-indigo-600 p-2 rounded-lg transition"
                  title="Gerar Novo Código"
                >
                  🎲
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handlePush}
                disabled={isSyncing || !syncId}
                className="bg-white text-indigo-900 px-4 py-3 rounded-xl font-bold hover:bg-indigo-50 transition disabled:opacity-50 flex flex-col items-center"
              >
                <span className="text-xl mb-1">📤</span>
                <span className="text-xs">Enviar para Nuvem</span>
              </button>
              <button
                onClick={handlePull}
                disabled={isSyncing || !syncId}
                className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-500 transition border border-indigo-500 disabled:opacity-50 flex flex-col items-center"
              >
                <span className="text-xl mb-1">📥</span>
                <span className="text-xs">Baixar da Nuvem</span>
              </button>
            </div>

            {isSyncing && (
              <div className="flex items-center justify-center space-x-2 text-indigo-300 animate-pulse">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="text-sm font-medium">Sincronizando dados...</span>
              </div>
            )}

            {syncStatus && (
              <p className={`text-center text-sm font-bold ${syncStatus.includes('Erro') ? 'text-red-300' : 'text-emerald-300'}`}>
                {syncStatus}
              </p>
            )}

            <div className="bg-indigo-800/40 p-4 rounded-xl text-[10px] leading-relaxed text-indigo-200 border border-indigo-700/50">
              <p className="font-bold mb-1">COMO USAR:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>No Computador 1, gere um código e clique em <strong>Enviar</strong>.</li>
                <li>No Computador 2, insira o <strong>mesmo código</strong> e clique em <strong>Baixar</strong>.</li>
                <li>Repita o processo sempre que quiser atualizar os dados entre as máquinas.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
