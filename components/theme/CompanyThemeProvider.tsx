'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hexToHsl } from '@/lib/utils';

export function CompanyThemeProvider() {
    const { user } = useAuth();
    const primaryColor = user?.employee?.company?.primary_color;
    const secondaryColor = user?.employee?.company?.secondary_color;

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

                console.log(`[Theme] Applied company primary color: ${primaryColor} -> ${hsl}`);
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

                console.log(`[Theme] Applied company secondary color: ${secondaryColor} -> ${hsl}`);
            }
        }
    }, [primaryColor, secondaryColor]);

    return null;
}
