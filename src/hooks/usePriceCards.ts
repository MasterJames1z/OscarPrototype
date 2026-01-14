import { useState, useCallback, useEffect } from 'react';
import type { PriceCard } from '../types';
import { getCardStatus } from '../utils/date.ts';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const API_BASE_URL = 'http://localhost:5000/api';

export function usePriceCards() {
    const [cards, setCards] = useState<PriceCard[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPrices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/product-prices`);
            if (!response.ok) throw new Error('Failed to fetch prices');
            const data = await response.json();

            const mappedCards: PriceCard[] = data.map((item: any) => ({
                PriceID: item.PriceID,
                ProductID: item.ProductID,
                ProductName: item.ProductName,
                EffectiveDate: item.EffectiveDate,
                ToDate: item.ToDate || item.EffectiveDate,
                UnitPrice: item.UnitPrice,
                status: getCardStatus(item.EffectiveDate, item.ToDate || item.EffectiveDate),
                createdAt: item.createdAt
            }));

            setCards(mappedCards);
        } catch (err) {
            console.error('Failed to fetch prices', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    const addCard = useCallback(async (cardData: Omit<PriceCard, 'PriceID' | 'status' | 'createdAt'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/product-prices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ProductID: cardData.ProductID,
                    EffectiveDate: cardData.EffectiveDate,
                    UnitPrice: cardData.UnitPrice
                }),
            });
            if (!response.ok) throw new Error('Failed to set price');
            await fetchPrices();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [fetchPrices]);

    const deleteCard = useCallback(async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/product-prices/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete price');
            await fetchPrices();
        } catch (err) {
            console.error(err);
        }
    }, [fetchPrices]);

    const getTodayPrice = useCallback((productIdentifier: string | number) => {
        const today = dayjs().format('YYYY-MM-DD');
        const activeCard = cards.find(c => {
            const isMatch = typeof productIdentifier === 'number'
                ? c.ProductID === productIdentifier
                : c.ProductName === productIdentifier;

            return isMatch && dayjs(today).isSameOrAfter(c.EffectiveDate) && (!c.ToDate || dayjs(today).isSameOrBefore(c.ToDate));
        });
        return activeCard?.UnitPrice || 0;
    }, [cards]);

    return {
        cards,
        loading,
        addCard,
        deleteCard,
        getTodayPrice,
        refresh: fetchPrices
    };
}
