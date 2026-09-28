import { Asset, DashboardStats, Inspection, Maintenance, LifecycleEvent, RiskAssessment } from '../types/asset';
import { User, LoginResponse } from '../types/auth';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('rnb_auth_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('rnb_auth_token', token);
  } else {
    localStorage.removeItem('rnb_auth_token');
  }
}

export function getStoredUser(): User | null {
  const str = localStorage.getItem('rnb_user_payload');
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem('rnb_user_payload', JSON.stringify(user));
  } else {
    localStorage.removeItem('rnb_user_payload');
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch (e) {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string): Promise<LoginResponse> => {
    return fetchJson<LoginResponse>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: (): Promise<{ user: User }> => {
    return fetchJson<{ user: User }>(`${API_BASE}/auth/me`);
  },

  // Users (Super Admin Only)
  getUsers: (): Promise<User[]> => {
    return fetchJson<User[]>(`${API_BASE}/users`);
  },

  createUser: (userData: Partial<User> & { password: string }): Promise<User> => {
    return fetchJson<User>(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: (id: string, userData: Partial<User> & { password?: string }): Promise<User> => {
    return fetchJson<User>(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: (id: string): Promise<{ message: string; id: string }> => {
    return fetchJson<{ message: string; id: string }>(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Dashboard
  getDashboardStats: (category?: string): Promise<DashboardStats> => {
    const query = category ? `?category=${category}` : '';
    return fetchJson<DashboardStats>(`${API_BASE}/dashboard/stats${query}`);
  },

  // Assets
  getAssets: (params?: {
    search?: string;
    assetType?: string;
    district?: string;
    condition?: string;
    riskLevel?: string;
    status?: string;
    maintenanceStatus?: string;
  }): Promise<Asset[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'ALL') query.append(key, val);
      });
    }
    return fetchJson<Asset[]>(`${API_BASE}/assets?${query.toString()}`);
  },

  getAssetById: (id: string): Promise<Asset> => {
    return fetchJson<Asset>(`${API_BASE}/assets/${id}`);
  },

  createAsset: (assetData: Partial<Asset> & Record<string, any>): Promise<Asset> => {
    return fetchJson<Asset>(`${API_BASE}/assets`, {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  },

  updateAsset: (id: string, assetData: Partial<Asset> & Record<string, any>): Promise<Asset> => {
    return fetchJson<Asset>(`${API_BASE}/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assetData),
    });
  },

  deleteAsset: (id: string): Promise<{ message: string; id: string }> => {
    return fetchJson<{ message: string; id: string }>(`${API_BASE}/assets/${id}`, {
      method: 'DELETE',
    });
  },

  getAssetLifecycle: (id: string): Promise<LifecycleEvent[]> => {
    return fetchJson<LifecycleEvent[]>(`${API_BASE}/assets/${id}/lifecycle`);
  },

  getAssetRisk: (id: string): Promise<RiskAssessment> => {
    return fetchJson<RiskAssessment>(`${API_BASE}/assets/${id}/risk`);
  },

  // Inspections
  getInspections: (): Promise<Inspection[]> => {
    return fetchJson<Inspection[]>(`${API_BASE}/inspections`);
  },

  createInspection: (inspectionData: {
    assetId: string;
    inspectionDate: string;
    inspectorName: string;
    condition: string;
    observations: string;
    recommendedAction: string;
    photoUrl?: string;
  }): Promise<{ inspection: Inspection; assetCondition: string; latestRisk: RiskAssessment }> => {
    return fetchJson(`${API_BASE}/inspections`, {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  },

  // Maintenance
  getMaintenanceList: (params?: { status?: string; priority?: string; assetId?: string }): Promise<Maintenance[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'ALL') query.append(key, val);
      });
    }
    return fetchJson<Maintenance[]>(`${API_BASE}/maintenance?${query.toString()}`);
  },

  createMaintenance: (maintenanceData: {
    assetId: string;
    issue: string;
    priority: string;
    action: string;
    assignedTo: string;
    expectedCompletionDate?: string;
    cost?: number;
    status?: string;
    beforePhotoUrl?: string;
  }): Promise<{ maintenance: Maintenance; latestRisk: RiskAssessment }> => {
    return fetchJson(`${API_BASE}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    });
  },

  updateMaintenance: (
    id: string,
    updateData: {
      status?: string;
      priority?: string;
      action?: string;
      assignedTo?: string;
      expectedCompletionDate?: string;
      actualCompletionDate?: string;
      cost?: number;
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
    }
  ): Promise<{ maintenance: Maintenance; latestRisk: RiskAssessment }> => {
    return fetchJson(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Reports
  getReportSummary: (): Promise<{ districtBreakdown: any[]; totalAssetsCount: number }> => {
    return fetchJson(`${API_BASE}/reports/summary`);
  },

  exportCsvUrl: () => `${API_BASE}/reports/export-csv`,
};
