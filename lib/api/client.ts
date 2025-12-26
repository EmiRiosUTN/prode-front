import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '@/lib/types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor to add JWT token and tenant header for multi-tenant
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log('[API Client] Request interceptor - URL:', config.url);

        if (typeof window !== 'undefined') {
            // Get token from localStorage
            const token = localStorage.getItem('accessToken');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Determine Tenant Slug
            let tenantSlug: string | null = null;

            // 1. Try from User Session (Logged in)
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if ((user.role === 'empresa_admin' || user.role === 'empleado') && user.employee?.company?.slug) {
                        tenantSlug = user.employee.company.slug;
                    }
                } catch (e) {
                    console.error('[API Client] Error parsing user data:', e);
                }
            }

            // 2. Fallback: Try from URL Subdomain (Public pages like /register)
            if (!tenantSlug) {
                const hostname = window.location.hostname;
                // Logic: subdomain.domain.com or subdomain.localhost
                const parts = hostname.split('.');
                // Check if we have a subdomain
                // e.g. "dolo.localhost" (2 parts) -> "dolo"
                // "dolo.myapp.com" (3 parts) -> "dolo"
                // "localhost" (1 part) -> null
                if (parts.length >= 2 && !hostname.startsWith('127.0.0.1')) {
                    // Exclude 'www' as a tenant if necessary, though unlikely for this app
                    if (parts[0] !== 'www') {
                        tenantSlug = parts[0];
                    }
                }
            }

            // Set Header if slug found
            if (tenantSlug && config.headers) {
                config.headers['X-Tenant-Slug'] = tenantSlug;
                console.log('[API Client] ✅ Setting X-Tenant-Slug:', tenantSlug);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<ApiError>) => {
        // Handle 401 Unauthorized - clear token and redirect to login
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// Helper function to extract error message
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiError;
        if (apiError?.message) {
            if (Array.isArray(apiError.message)) {
                return apiError.message.join(', ');
            }
            return apiError.message;
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}
