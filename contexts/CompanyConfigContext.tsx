'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Company } from '@/lib/types';
import { companyApi } from '@/lib/api/endpoints';
import { hexToHsl } from '@/lib/utils';

interface CompanyConfigContextType {
    config: Company | null;
    isLoading: boolean;
    error: string | null;
}

const CompanyConfigContext = createContext<CompanyConfigContextType>({
    config: null,
    isLoading: true,
    error: null,
});

export const useCompanyConfig = () => useContext(CompanyConfigContext);

export function CompanyConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadConfig = async () => {
            try {
                // Determine Tenant Slug
                const hostname = window.location.hostname;
                const parts = hostname.split('.');
                const subdomain = parts[0];

                if (parts.length < 2 || hostname === '127.0.0.1' || subdomain === 'admin' || subdomain === 'localhost') {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                const response = await companyApi.getPublicConfig();
                if (isMounted && response?.data) {
                    const companyConfig = response.data;
                    setConfig(companyConfig);

                    // Inject CSS Variables for the Theme globally
                    const primaryUrl = companyConfig.primary_color;
                    const secondaryUrl = companyConfig.secondary_color;

                    if (primaryUrl) {
                        const primHsl = hexToHsl(primaryUrl);
                        if (primHsl) {
                            document.documentElement.style.setProperty('--primary', primHsl);
                            const pParts = primHsl.split(' ');
                            if (pParts.length === 3) {
                                const h = parseInt(pParts[0]);
                                const s = parseInt(pParts[1].replace('%', ''));
                                const l = parseInt(pParts[2].replace('%', ''));
                                if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
                                    const foreground = l > 60 ? '0 0% 0%' : '0 0% 100%';
                                    document.documentElement.style.setProperty('--primary-foreground', foreground);
                                    const lightL = Math.min(l + 15, 95);
                                    document.documentElement.style.setProperty('--primary-light', `${h} ${s}% ${lightL}%`);
                                }
                            }
                        }
                    }

                    if (secondaryUrl) {
                        const secHsl = hexToHsl(secondaryUrl);
                        if (secHsl) {
                            document.documentElement.style.setProperty('--secondary', secHsl);
                            const sParts = secHsl.split(' ');
                            if (sParts.length === 3) {
                                const h = parseInt(sParts[0]);
                                const s = parseInt(sParts[1].replace('%', ''));
                                const l = parseInt(sParts[2].replace('%', ''));
                                if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
                                    const foreground = l > 60 ? '0 0% 0%' : '0 0% 100%';
                                    document.documentElement.style.setProperty('--secondary-foreground', foreground);
                                    const lightL = Math.min(l + 20, 97);
                                    const lightS = Math.max(s - 10, 10);
                                    document.documentElement.style.setProperty('--secondary-light', `${h} ${lightS}% ${lightL}%`);
                                }
                            }
                        }
                    }
                }
            } catch (err: any) {
                console.error('[CompanyConfigProvider] Error loading public config:', err);
                if (isMounted) setError(err.message || 'Failed to load company config');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadConfig();

        return () => {
            isMounted = false;
        };
    }, []);

    // Evitamos mostrar la app blanca durante los primeros ms, 
    // pero para SEO/UX si no hay config igual mostramos children tras el checkeo.
    // Esto asegura que se inyecte el CSS ANTES de que los componentes hijos lo usen.
    if (isLoading) {
       // Optional: return a generic global loading screen here or just children
       // Returning children allows faster paint but might FOUC.
       // Returning null or a loader prevents FOUC.
       return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
            </div>
       );
    }

    return (
        <CompanyConfigContext.Provider value={{ config, isLoading, error }}>
            {children}
        </CompanyConfigContext.Provider>
    );
}
