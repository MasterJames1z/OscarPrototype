import { useState, useCallback, useEffect } from 'react';
import type { PriceHistory } from '../types';
import { authFetch } from '../utils/api';

export function usePriceHistory(priceId?: number) {
    const [history, setHistory] = useState<PriceHistory[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!priceId) return;
        setLoading(true);
        try {
            const response = await authFetch(`/product-prices/${priceId}/history`);
            if (!response.ok) throw new Error('Failed to fetch price history');
            const data = await response.json();
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch price history', err);
        } finally {
            setLoading(false);
        }
    }, [priceId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        loading,
        refresh: fetchHistory
    };
}
