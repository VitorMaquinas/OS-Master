
import { ServiceOrder, User, CompanySettings } from '../types';

const ORDERS_KEY = 'os_master_orders';
const USERS_KEY = 'os_master_users';
const SESSION_KEY = 'os_master_session';
const SETTINGS_KEY = 'os_master_settings';
const SYNC_ID_KEY = 'os_master_sync_id';

// Base URL para um serviço de armazenamento temporário/simples para demonstração de sincronização
// Em um cenário real, isso seria substituído por um backend robusto (Firebase/Supabase)
const CLOUD_API = 'https://api.jsonbin.io/v3/b'; 
// Nota: Usando um endpoint público simulado para funcionalidade de transferência

export const storageService = {
  getAllData: () => {
    return {
      orders: storageService.getOrders(),
      users: storageService.getUsers(),
      settings: storageService.getSettings()
    };
  },

  importAllData: (data: any) => {
    if (data.orders) localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
    if (data.users) localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
  },

  getOrders: (): ServiceOrder[] => {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveOrder: (order: ServiceOrder) => {
    const orders = storageService.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  deleteOrder: (id: string) => {
    const orders = storageService.getOrders().filter(o => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  getUsers: (): any[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: any) => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  setSession: (user: User | null) => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  getSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  getSettings: (): CompanySettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { name: 'Minha Empresa' };
  },

  saveSettings: (settings: CompanySettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getSyncId: () => localStorage.getItem(SYNC_ID_KEY) || '',
  setSyncId: (id: string) => localStorage.setItem(SYNC_ID_KEY, id),

  // Sincronização via JSONBin (Exemplo de integração externa)
  // Para fins deste programa, usaremos uma abordagem de "Transferência via Código"
  async pushToCloud(syncId: string): Promise<boolean> {
    try {
      const allData = storageService.getAllData();
      // Simulando salvamento remoto. Em produção, usaria um X-Master-Key
      const response = await fetch(`https://api.keyvalue.xyz/customer/ospro-${syncId}`, {
        method: 'POST',
        body: JSON.stringify(allData)
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  async pullFromCloud(syncId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.keyvalue.xyz/customer/ospro-${syncId}`);
      if (response.ok) {
        const data = await response.json();
        storageService.importAllData(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
