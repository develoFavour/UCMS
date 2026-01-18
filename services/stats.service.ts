import { ENDPOINTS } from "@/constants/endpoint.const"
import { API } from "@/lib/method"

export const statsService = {
    async getStats() {
        return API.get(ENDPOINTS.STATS)
    }
}
