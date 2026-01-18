import { ENDPOINTS } from "@/constants/endpoint.const"
import { API } from "@/lib/method"
import { useAuthStore } from "@/store/auth.store"

export interface LoginResponse {
    accessToken: string
    userId: number
    email: string
    role: string
    full_name: string
    error?: string
}

export const authService = {
    async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
        const data = await API.post(ENDPOINTS.AUTH.LOGIN, credentials)
        if (data.accessToken) {
            useAuthStore.getState().setAuth(
                {
                    id: data.userId,
                    email: data.email,
                    role: data.role,
                    full_name: data.full_name
                },
                data.accessToken
            )
        }
        return data
    },

    async register(registrationData: any) {
        const data = await API.post(ENDPOINTS.AUTH.REGISTER, registrationData)
        if (data.accessToken) {
            useAuthStore.getState().setAuth(
                {
                    id: data.userId,
                    email: data.email,
                    role: data.role,
                    full_name: data.full_name || registrationData.full_name
                },
                data.accessToken
            )
        }
        return data
    },

    async logout() {
        try {
            await API.post(ENDPOINTS.AUTH.LOGOUT)
        } finally {
            useAuthStore.getState().logout()
            if (typeof window !== "undefined") {
                window.location.href = "/login"
            }
        }
    },

    async getMe() {
        return API.get(ENDPOINTS.AUTH.ME)
    },

    async updateCounselorProfile(data: { bio: string; specializations: string[] }) {
        return API.put("/api/counselor/profile", data)
    }
}
