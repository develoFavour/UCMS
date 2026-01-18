import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface User {
    id: number
    email: string
    role: string
    full_name: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean

    // Actions
    setAuth: (user: User, accessToken: string) => void
    setAccessToken: (token: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken) =>
                set({ user, accessToken, isAuthenticated: true }),

            setAccessToken: (accessToken) =>
                set({ accessToken }),

            logout: () =>
                set({ user: null, accessToken: null, isAuthenticated: false }),
        }),
        {
            name: "ucms-auth-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)
