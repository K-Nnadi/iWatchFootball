import {create} from "zustand";
import type { User } from "@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas";

interface AuthStore {
    isLoggedIn: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    isLoggedIn: false,
    user: null,
    token: null,
    login: (token: string, user: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ isLoggedIn: true, user, token });
    },
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        set({ isLoggedIn: false, user: null, token: null });
    },
    initializeAuth: () => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr) as User;
                set({ isLoggedIn: true, user, token });
            } catch {
                // Invalid user data, clear it
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
    }
}))