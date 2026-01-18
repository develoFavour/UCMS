import { ENDPOINTS } from "@/constants/endpoint.const"
import { useAuthStore } from "@/store/auth.store"

async function handleResponse(response: Response, originalRequest: () => Promise<any>): Promise<any> {
    const { logout, setAccessToken } = useAuthStore.getState()

    if (response.status === 401 && !response.url.includes(ENDPOINTS.AUTH.REFRESH)) {
        try {
            // Attempt to refresh the token
            const refreshRes = await fetch(ENDPOINTS.AUTH.REFRESH, { method: "POST" })
            if (refreshRes.ok) {
                // Issuing refresh logic usually sets cookies, but if we have an accessToken in memory:
                const data = await refreshRes.json()
                if (data.accessToken) {
                    setAccessToken(data.accessToken)
                }

                // Retry the original request
                return originalRequest()
            }
        } catch (err) {
            console.error("Token refresh failed:", err)
        }

        // If refresh fails or refresh results in 401
        logout()
        if (typeof window !== "undefined") {
            window.location.href = "/login"
        }
        throw new Error("Session expired. Please log in again.")
    }

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }
    return data
}

export const API = {
    async get(endpoint: string): Promise<any> {
        const response = await fetch(endpoint)
        return handleResponse(response, () => this.get(endpoint))
    },

    async post(endpoint: string, body?: any): Promise<any> {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        })
        return handleResponse(response, () => this.post(endpoint, body))
    },

    async put(endpoint: string, body?: any): Promise<any> {
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        })
        return handleResponse(response, () => this.put(endpoint, body))
    },

    async patch(endpoint: string, body?: any): Promise<any> {
        const response = await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        })
        return handleResponse(response, () => this.patch(endpoint, body))
    },

    async delete(endpoint: string): Promise<any> {
        const response = await fetch(endpoint, {
            method: "DELETE",
        })
        return handleResponse(response, () => this.delete(endpoint))
    },
}
