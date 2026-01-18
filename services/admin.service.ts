import { ENDPOINTS } from "@/constants/endpoint.const"
import { API } from "@/lib/method"

export interface AdminCounselor {
    id: number
    name: string
    email: string
    role: string
    status: "active" | "pending" | "suspended"
    total_students: number
    rating: number
    specializations?: string[]
}

export const adminService = {
    async inviteCounselor(email: string) {
        return API.post(ENDPOINTS.AUTH.INVITE, {
            email,
            role: "counselor",
            expires_in_days: 7
        })
    },

    async getCounselors(): Promise<AdminCounselor[]> {
        return API.get(ENDPOINTS.ADMIN.COUNSELORS)
    }
}
