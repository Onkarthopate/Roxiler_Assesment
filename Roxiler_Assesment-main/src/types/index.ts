export type Role = 'admin' | 'user' | 'store_owner';

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
  created_at?: string;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  owner_id: number;
  average_rating?: number;
  created_at?: string;
}

export interface Rating {
  id: number;
  user_id: number;
  store_id: number;
  rating: number;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  store_name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  address: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}