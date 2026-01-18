import { ENDPOINTS } from "@/constants/endpoint.const"
import { API } from "@/lib/method"

export const appointmentService = {
    async getAppointments() {
        return API.get(ENDPOINTS.APPOINTMENTS.BASE)
    },

    async createAppointment(data: any) {
        return API.post(ENDPOINTS.APPOINTMENTS.BASE, data)
    },

    async updateAppointment(id: string, data: any) {
        return API.patch(ENDPOINTS.APPOINTMENTS.BY_ID(id), data)
    }
}
