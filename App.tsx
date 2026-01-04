
import React, { useState, useEffect } from 'react';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import OrderListView from './views/OrderListView';
import OrderFormView from './views/OrderFormView';
import SettingsView from './views/SettingsView';
import Layout from './components/Layout';
import { User, ServiceOrder } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'new' | 'settings'>('dashboard');
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    const session = storageService.getSession();
    if (session) {
      setUser(session);
    }
  }, []);

  const handleLogin = (loggedUser: User) => {
    storageService.setSession(loggedUser);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    storageService.setSession(null);
    setUser(null);
  };

  const handleEditOrder = (order: ServiceOrder) => {
    setEditingOrder(order);
    setActiveTab('new');
  };

  const handleOrderSaved = () => {
    setEditingOrder(null);
    setActiveTab('orders');
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={(tab) => {
      if (tab !== 'new') setEditingOrder(null);
      setActiveTab(tab);
    }}>
      {activeTab === 'dashboard' && <DashboardView onNewOrder={() => setActiveTab('new')} />}
      {activeTab === 'orders' && <OrderListView onEdit={handleEditOrder} />}
      {activeTab === 'new' && <OrderFormView initialData={editingOrder} onSaved={handleOrderSaved} />}
      {activeTab === 'settings' && <SettingsView />}
    </Layout>
  );
};

export default App;
