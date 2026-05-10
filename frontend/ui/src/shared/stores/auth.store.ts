import {create} from "zustand";
import type { User } from "@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas";

function readStoredAuth(): { isLoggedIn: boolean; user: User | null; token: string | null } {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr) as User;
            return { isLoggedIn: true, user, token };
        } catch {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    }
    return { isLoggedIn: false, user: null, token: null };
}

interface AuthStore {
    isLoggedIn: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    ...readStoredAuth(),
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
        set(readStoredAuth());
    },
}))