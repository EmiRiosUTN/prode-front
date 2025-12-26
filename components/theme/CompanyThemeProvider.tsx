'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hexToHsl } from '@/lib/utils';

export function CompanyThemeProvider() {
    const { user } = useAuth();
    const primaryColor = user?.employee?.company?.primary_color;

    useEffect(() => {
        if (primaryColor) {
            const hsl = hexToHsl(primaryColor);
            if (hsl) {
                document.documentElement.style.setProperty('--primary', hsl);

                const parts = hsl.split(' ');
                if (parts.length === 3) {
                    const l = parseInt(parts[2].replace('%', ''));
                    if (!isNaN(l)) {
                        const foreground = l > 60 ? '0 0% 0%' : '0 0% 100%';
                        document.documentElement.style.setProperty('--primary-foreground', foreground);
                    }
                }

                console.log(`[Theme] Applied company primary color: ${primaryColor} -> ${hsl}`);
            }
        }
    }, [primaryColor]);

    return null;
}
