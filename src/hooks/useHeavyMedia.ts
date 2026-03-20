import { useState, useEffect } from 'react';

export function useHeavyMedia(shouldReduceMotion: boolean): boolean {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Si el usuario ya pide reducción de movimiento, evitamos la carga del video.
        if (shouldReduceMotion) return;

        // 1. Detectar ahorro de datos o conexiones lentas (3G o peor)
        const nav = navigator as any;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        if (connection && (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType))) {
            return; // shouldLoad se mantiene en false
        }

        // 2. Detectar dispositivos móviles
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setShouldLoad(!e.matches);
        };

        handleMediaChange(mediaQuery);
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }, [shouldReduceMotion]);

    return shouldLoad;
}