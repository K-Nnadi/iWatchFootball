import {create} from "zustand";


interface AuthStore {
    isLoggedIn: boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
    //todo need to be replace with auth state from backend
    isLoggedIn: false
}))