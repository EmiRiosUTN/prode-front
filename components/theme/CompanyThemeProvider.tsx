'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hexToHsl } from '@/lib/utils';

export function CompanyThemeProvider() {
    const { user } = useAuth();
    // Safely access nested properties
    const primaryColor = user?.employee?.company?.primary_color;

    useEffect(() => {
        if (primaryColor) {
            const hsl = hexToHsl(primaryColor);
            if (hsl) {
                // Set the primary color
                document.documentElement.style.setProperty('--primary', hsl);

                // Calculate contrast for foreground (text on primary button)
                // If lightness is > 50%, use black text, otherwise white.
                // hsl string is "H S% L%"
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
        } else {
            // Optional: Reset to default if user logs out or has no color
            // document.documentElement.style.removeProperty('--primary');
            // document.documentElement.style.removeProperty('--primary-foreground');
        }
    }, [primaryColor]);

    return null;
}
