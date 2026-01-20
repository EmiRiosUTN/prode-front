'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hexToHsl } from '@/lib/utils';
import { companyApi } from '@/lib/api/endpoints';

export function CompanyThemeProvider() {
    const [primaryColor, setPrimaryColor] = useState<string | undefined>(undefined);
    const [secondaryColor, setSecondaryColor] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                // Try to get public config based on subdomain
                const response = await companyApi.getPublicConfig();
                if (response && response.success && response.data) {
                    const company = response.data;
                    setPrimaryColor(company.primary_color);
                    setSecondaryColor(company.secondary_color);
                    console.log(`[Theme] Loaded config for ${company.name}`);
                }
            } catch (error) {
                console.log('[Theme] Failed to load company config (likely not on a tenant subdomain)', error);
            }
        };

        fetchTheme();
    }, []);

    useEffect(() => {
        if (primaryColor) {
            const hsl = hexToHsl(primaryColor);
            if (hsl) {
                document.documentElement.style.setProperty('--primary', hsl);

                const parts = hsl.split(' ');
                if (parts.length === 3) {
                    const h = parseInt(parts[0]);
                    const s = parseInt(parts[1].replace('%', ''));
                    const l = parseInt(parts[2].replace('%', ''));

                    if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
                        // Calculate foreground color for contrast
                        const foreground = l > 60 ? '0 0% 0%' : '0 0% 100%';
                        document.documentElement.style.setProperty('--primary-foreground', foreground);

                        // Create light variant for hover states and backgrounds
                        const lightL = Math.min(l + 15, 95);
                        document.documentElement.style.setProperty('--primary-light', `${h} ${s}% ${lightL}%`);
                    }
                }
            }
        }

        if (secondaryColor) {
            const hsl = hexToHsl(secondaryColor);
            if (hsl) {
                document.documentElement.style.setProperty('--secondary', hsl);

                const parts = hsl.split(' ');
                if (parts.length === 3) {
                    const h = parseInt(parts[0]);
                    const s = parseInt(parts[1].replace('%', ''));
                    const l = parseInt(parts[2].replace('%', ''));

                    if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
                        // Calculate foreground color for contrast
                        const foreground = l > 60 ? '0 0% 0%' : '0 0% 100%';
                        document.documentElement.style.setProperty('--secondary-foreground', foreground);

                        // Create light variant for subtle backgrounds
                        const lightL = Math.min(l + 20, 97);
                        const lightS = Math.max(s - 10, 10);
                        document.documentElement.style.setProperty('--secondary-light', `${h} ${lightS}% ${lightL}%`);
                    }
                }
            }
        }
    }, [primaryColor, secondaryColor]);

    return null;
}
