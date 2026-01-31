import { useState, useCallback, useEffect } from 'react';
import type { PriceCard } from '../types';
import { getCardStatus } from '../utils/date.ts';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { authFetch } from '../utils/api';


export function usePriceCards() {
    const [cards, setCards] = useState<PriceCard[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPrices = useCallback(async () => {
        setLoading(true);
        try {
            // Add cache-buster to ensure we get fresh data after updates
            const response = await authFetch(`/product-prices?_t=${Date.now()}`);
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

    const addCard = useCallback(async (cardData: Omit<PriceCard, 'PriceID' | 'status' | 'createdAt'>, changedBy?: string) => {
        try {
            const response = await authFetch('/product-prices', {
                method: 'POST',
                body: JSON.stringify({
                    ProductID: cardData.ProductID,
                    EffectiveDate: cardData.EffectiveDate,
                    ToDate: cardData.ToDate,
                    UnitPrice: cardData.UnitPrice,
                    ChangedBy: changedBy // Added field
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

    const updateCard = useCallback(async (id: number, cardData: Partial<PriceCard>, changedBy?: string) => {
        try {
            const response = await authFetch(`/product-prices/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...cardData,
                    ChangedBy: changedBy // Added field
                }),
            });
            if (!response.ok) throw new Error('Failed to update price');
            await fetchPrices();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [fetchPrices]);

    const deleteCard = useCallback(async (id: number) => {
        try {
            const response = await authFetch(`/product-prices/${id}`, {
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
        updateCard,
        deleteCard,
        getTodayPrice,
        refresh: fetchPrices
    };
}
