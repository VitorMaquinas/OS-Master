
export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Execução',
  COMPLETED = 'Concluída',
  CANCELLED = 'Cancelada'
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientData {
  name: string;
  cnpj: string;
  phone: string;
  address: string;
  email?: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  client: ClientData;
  equipmentName: string;
  serialNumber: string;
  entryDate: string;
  services: ServiceItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  totalValue: number;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
}

export interface CompanySettings {
  name: string;
  logo?: string;
}
