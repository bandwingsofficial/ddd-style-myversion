import { create } from "zustand";
import { UsersService } from "./users.service";
import { OutletUser } from "./users.types";

interface UsersState {
  users: OutletUser[];
  outlets: any[];
  loading: boolean;
  error: string | null;

  fetchOutlets(): Promise<void>;
  fetchUsers(outletId: string): Promise<void>;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  outlets: [],
  loading: false,
  error: null,

  async fetchOutlets() {
    set({ loading: true });
    try {
      const res = await UsersService.getOutlets();
      set({ outlets: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to load outlets", loading: false });
    }
  },

  async fetchUsers(outletId) {
    set({ loading: true });
    try {
      const res = await UsersService.getUsersByOutlet(outletId);
      set({ users: res.data.data, loading: false });
    } catch {
      set({ error: "Failed to load users", loading: false });
    }
  },
}));
