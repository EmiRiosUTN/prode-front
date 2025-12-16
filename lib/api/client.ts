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

            // Add tenant slug header for company routes (multi-tenant)
            // NOTE: Cannot use Host header - browsers don't allow modifying it
            const userStr = localStorage.getItem('user');
            console.log('[API Client] User from localStorage:', userStr ? 'exists' : 'null');

            if (userStr && config.url) {
                try {
                    const user = JSON.parse(userStr);
                    console.log('[API Client] User role:', user.role);
                    console.log('[API Client] Employee company slug:', user.employee?.company?.slug);

                    // If user is empresa_admin or empleado and accessing company/employee routes
                    if ((user.role === 'empresa_admin' || user.role === 'empleado') &&
                        (config.url.includes('/company') || config.url.includes('/prodes') || config.url.includes('/predictions'))) {

                        // Get company slug from user's employee data
                        const companySlug = user.employee?.company?.slug;
                        if (companySlug && config.headers) {
                            // Use custom header - backend needs to be updated to accept this
                            config.headers['X-Tenant-Slug'] = companySlug;
                            console.log('[API Client] ✅ Setting X-Tenant-Slug:', companySlug);
                            console.log('[API Client] All headers:', config.headers);
                        } else {
                            console.log('[API Client] ❌ No company slug found or no headers');
                        }
                    } else {
                        console.log('[API Client] Route does not require tenant header');
                    }
                } catch (e) {
                    console.error('[API Client] Error parsing user data:', e);
                }
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
