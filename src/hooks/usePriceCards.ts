import { useState, useCallback } from 'react';
import type { PriceCard } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getCardStatus, doRangesOverlap } from '../utils/date.ts';
import dayjs from 'dayjs';

const STORAGE_KEY = 'oscar_price_cards';

const MOCK_RESOURCES = [
    'Rubber Wood - Grade A',
    'Rubber Wood - Grade B',
    'Rubber Wood - Grade C',
    'Eucalyptus',
    'Acacia',
];

const INITIAL_CARDS: PriceCard[] = [
    {
        id: '1',
        resourceName: 'Rubber Wood - Grade A',
        startDate: '2026-01-01',
        endDate: '2026-01-15',
        unitPrice: 2500,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'Oscar User',
    },
    {
        id: '2',
        resourceName: 'Rubber Wood - Grade B',
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        unitPrice: 2200,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'Oscar User',
    },
];

export function usePriceCards() {
    const [cards, setCards] = useState<PriceCard[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        return INITIAL_CARDS;
    });

    const saveCards = useCallback((newCards: PriceCard[]) => {
        setCards(newCards);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards));
    }, []);

    const addCard = useCallback((cardData: Omit<PriceCard, 'id' | 'createdAt' | 'status' | 'createdBy'>) => {
        const hasOverlap = cards.some(c =>
            c.resourceName === cardData.resourceName &&
            doRangesOverlap(c.startDate, c.endDate, cardData.startDate, cardData.endDate)
        );

        if (hasOverlap) {
            return false;
        }

        const newCard: PriceCard = {
            ...cardData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            createdBy: 'Oscar User',
            status: getCardStatus(cardData.startDate, cardData.endDate),
        };
        saveCards([newCard, ...cards]);
        return true;
    }, [cards, saveCards]);

    const updateCard = useCallback((id: string, cardData: Omit<PriceCard, 'id' | 'createdAt' | 'status' | 'createdBy'>) => {
        const hasOverlap = cards.some(c =>
            c.id !== id &&
            c.resourceName === cardData.resourceName &&
            doRangesOverlap(c.startDate, c.endDate, cardData.startDate, cardData.endDate)
        );

        if (hasOverlap) {
            return false;
        }

        const updatedCards = cards.map(c =>
            c.id === id
                ? { ...c, ...cardData, status: getCardStatus(cardData.startDate, cardData.endDate) }
                : c
        );
        saveCards(updatedCards);
        return true;
    }, [cards, saveCards]);

    const deleteCard = useCallback((id: string) => {
        const filtered = cards.filter(c => c.id !== id);
        saveCards(filtered);
    }, [cards, saveCards]);

    const duplicateCard = useCallback((id: string) => {
        const cardToDup = cards.find(c => c.id === id);
        if (cardToDup) {
            const nextDay = dayjs(cardToDup.endDate).add(1, 'day').format('YYYY-MM-DD');
            const newCard: PriceCard = {
                ...cardToDup,
                id: uuidv4(),
                startDate: nextDay,
                endDate: nextDay,
                createdAt: new Date().toISOString(),
                createdBy: 'Oscar User',
                status: getCardStatus(nextDay, nextDay),
            };
            saveCards([newCard, ...cards]);
            return true;
        }
        return false;
    }, [cards, saveCards]);

    return {
        cards,
        addCard,
        updateCard,
        deleteCard,
        duplicateCard,
        allResources: MOCK_RESOURCES,
    };
}
