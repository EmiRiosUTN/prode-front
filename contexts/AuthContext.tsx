'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '@/lib/types';
import { authApi, LoginRequest, RegisterRequest } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse stored user:', err);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await authApi.login(credentials);

            console.log('[AuthContext] Full login response:', response);
            console.log('[AuthContext] User data:', response.data.user);
            console.log('[AuthContext] Employee:', response.data.user.employee);
            console.log('[AuthContext] Company:', response.data.user.employee?.company);

            const { accessToken, user: userData } = response.data;

            // Store in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            console.log('[AuthContext] Saved to localStorage:', userData);

            // Update state
            setToken(accessToken);
            setUser(userData);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await authApi.register(data);

            // Registration successful (no auto-login due to email verification)
            // The component will handle the redirect/success message
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
