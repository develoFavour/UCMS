export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        LOGOUT: "/api/auth/logout",
        REFRESH: "/api/auth/refresh",
        ME: "/api/auth/me",
        INVITE: "/api/admin/invite",
    },
    STATS: "/api/stats",
    COUNSELORS: "/api/counselors",
    APPOINTMENTS: {
        BASE: "/api/appointments",
        BY_ID: (id: string) => `/api/appointments/${id}`,
    },
    ADMIN: {
        COUNSELORS: "/api/admin/counselors",
    },
}
