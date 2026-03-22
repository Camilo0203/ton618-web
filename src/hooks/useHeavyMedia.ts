import { useState, useEffect } from 'react';

export function useHeavyMedia(shouldReduceMotion: boolean): boolean {
    const [shouldLoad, setShouldLoad] = useState(true);

    useEffect(() => {
        // Si el usuario ya pide reducción de movimiento, evitamos la carga del video.
        if (shouldReduceMotion) {
            setShouldLoad(false);
            return;
        }

        // Detectar ahorro de datos o conexiones lentas (2G o peor)
        const nav = navigator as Navigator & {
            connection?: { saveData?: boolean; effectiveType?: string };
            mozConnection?: { saveData?: boolean; effectiveType?: string };
            webkitConnection?: { saveData?: boolean; effectiveType?: string };
        };
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        const effectiveType = connection?.effectiveType ?? '';
        if (connection && (connection.saveData || ['slow-2g', '2g'].includes(effectiveType))) {
            setShouldLoad(false);
            return;
        }

        // Permitir carga de videos en todas las pantallas (desktop y móvil)
        setShouldLoad(true);
    }, [shouldReduceMotion]);

    return shouldLoad;
}