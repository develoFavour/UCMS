import { ENDPOINTS } from "@/constants/endpoint.const"
import { API } from "@/lib/method"

export interface Counselor {
    id: number
    user_id: number
    profile_picture_url: string | null
    bio: string | null
    specializations: string[] | null
    name: string
    email: string
    rating: number
    review_count: number
}

export const counselorService = {
    async getCounselors(): Promise<Counselor[]> {
        return API.get(ENDPOINTS.COUNSELORS)
    },

    async getCounselorAvailability(id: number) {
        return API.get(`${ENDPOINTS.COUNSELORS}/${id}/availability`)
    }
}
