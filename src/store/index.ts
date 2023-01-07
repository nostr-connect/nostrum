import create from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ZustandAsyncStorage } from './persist';

interface AppState {
  apps: App[];
  addApp: (app: App) => void;
  getAppByID: (id: string) => App | undefined;
  removeAppByID: (id: string) => void;
  removeApps: () => void;
}

interface App {
  id: string;
  relay: string;
  name: string;
  label: string;
  icons: string[];
  url: string;
}

export const useAppsStore = create<AppState>()(
  persist(
    (set, get) => ({
      apps: [],
      addApp: (app: App): void => set((state) => ({ apps: [...state.apps, app] })),
      getAppByID: (id: string): App | undefined => {
        const app = get().apps.find((app) => app.id === id);
        return app;
      },
      removeApps: (): void => set({ apps: [] }),
      removeAppByID: (id: string): void => {
        const apps = get().apps.filter((app) => app.id !== id);
        set({ apps });
      },
    }),
    {
      name: 'food-storage', // unique name
      storage: createJSONStorage(() => ZustandAsyncStorage),
    }
  )
);
