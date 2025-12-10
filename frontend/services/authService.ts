import { api } from '@/lib/axios';

export interface UserProfileResponse {
  id?: number;
  name: string;
  email?: string;
  imageUrl?: string | null;
  provider?: string;
  datasetPrefs?: DatasetPrefs;
  notificationPrefs?: NotificationPrefs;
}

export interface DatasetPrefs {
  autoDelete: boolean;
  autoDeleteDays: number;
  maxFileSize: number;
  defaultChartType: string;
}

export interface NotificationPrefs {
  uploadComplete: boolean;
  uploadFailed: boolean;
  weeklyReport: boolean;
  storageWarning: boolean;
}

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const { data } = await api.get(`/user/profile`);
    return data;
  },

  updateProfile: async (profile: Partial<UserProfileResponse>) => {
    return api.put(`/user/profile`, profile);
  },

  updatePreferences: async (prefs: {
    datasetPrefs: DatasetPrefs;
    notificationPrefs: NotificationPrefs;
  }) => {
    return api.put(`/user/preferences`, prefs);
  },

  deleteAccount: async () => {
    return api.delete(`/user/account`);
  },
};
