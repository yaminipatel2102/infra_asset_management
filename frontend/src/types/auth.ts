import { Role } from './asset';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  assetCategory: string;
  status?: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
