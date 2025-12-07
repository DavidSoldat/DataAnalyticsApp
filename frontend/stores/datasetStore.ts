// stores/datasetStore.ts
import { Dataset, datasetService } from '@/services/datasetService';
import { create } from 'zustand';

interface DatasetState {
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;

  fetchDatasets: (force?: boolean) => Promise<void>;
  addDataset: (dataset: Dataset) => void;
  updateDataset: (id: number, updates: Partial<Dataset>) => void;
  removeDataset: (id: number) => void;
  getDatasetById: (id: number) => Dataset | undefined;
  clearDatasets: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; 

export const useDatasetStore = create<DatasetState>((set, get) => ({
  datasets: [],
  loading: false,
  error: null,
  lastFetch: null,

  fetchDatasets: async (force = false) => {
    const { lastFetch, loading } = get();
    const now = Date.now();

    if (!force && lastFetch && now - lastFetch < CACHE_DURATION) {
      console.log('Using cached datasets');
      return;
    }

    if (loading) {
      console.log('Already fetching datasets');
      return;
    }

    set({ loading: true, error: null });

    try {
      const data = await datasetService.getAllDatasets();
      set({
        datasets: Array.isArray(data) ? data : [],
        loading: false,
        lastFetch: now,
        error: null,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to fetch datasets:', err);
      set({
        error: err?.response?.data?.message || 'Failed to load datasets',
        loading: false,
      });
    }
  },

  addDataset: (dataset: Dataset) => {
    set((state) => ({
      datasets: [dataset, ...state.datasets],
    }));
  },

  updateDataset: (id: number, updates: Partial<Dataset>) => {
    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }));
  },

  removeDataset: (id: number) => {
    set((state) => ({
      datasets: state.datasets.filter((d) => d.id !== id),
    }));
  },

  getDatasetById: (id: number) => {
    return get().datasets.find((d) => d.id === id);
  },

  clearDatasets: () => {
    set({ datasets: [], loading: false, error: null, lastFetch: null });
  },
}));
