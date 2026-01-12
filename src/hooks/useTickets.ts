import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Ticket } from '../types';

const STORAGE_KEY = 'oscar_tickets';

export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setTickets(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load tickets', e);
            }
        }
    }, []);

    const saveToStorage = (newTickets: Ticket[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTickets));
        setTickets(newTickets);
    };

    const addTicket = useCallback((ticket: Omit<Ticket, 'id' | 'createdAt'>) => {
        const newTicket: Ticket = {
            ...ticket,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        };
        const updated = [newTicket, ...tickets];
        saveToStorage(updated);
        return newTicket;
    }, [tickets]);

    const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
        const updated = tickets.map(t => t.id === id ? { ...t, ...updates } : t);
        saveToStorage(updated);
    }, [tickets]);

    const approveTicket = useCallback((id: string) => {
        updateTicket(id, { status: 'approved' });
    }, [updateTicket]);

    const deleteTicket = useCallback((id: string) => {
        const updated = tickets.filter(t => t.id !== id);
        saveToStorage(updated);
    }, [tickets]);

    const mockFetchWeighbridge = useCallback((getPrice?: (resource: string) => number) => {
        // Aligned with usePriceCards mocks
        const resources = [
            'Rubber Wood - Grade A',
            'Rubber Wood - Grade B',
            'Rubber Wood - Grade C',
            'Eucalyptus',
            'Acacia',
        ];
        const randomResource = resources[Math.floor(Math.random() * resources.length)];
        const weightIn = 15000 + Math.floor(Math.random() * 5000);
        const weightOut = 8000 + Math.floor(Math.random() * 2000);
        const netWeight = weightIn - weightOut;

        // Use provided price fetcher or fallback to random
        const unitPrice = getPrice ? getPrice(randomResource) : (1200 + Math.floor(Math.random() * 300));
        const totalPrice = (netWeight / 1000) * unitPrice;

        const newTicket: Ticket = {
            id: uuidv4(),
            ticketNumber: `WB-${Math.floor(100000 + Math.random() * 900000)}`,
            type: 'auto',
            resourceName: randomResource,
            weightIn,
            weightOut,
            netWeight,
            unitPrice,
            totalPrice,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: 'System (Weighbridge)',
        };

        const updated = [newTicket, ...tickets];
        saveToStorage(updated);
        return newTicket;
    }, [tickets]);

    return {
        tickets,
        addTicket,
        updateTicket,
        approveTicket,
        deleteTicket,
        mockFetchWeighbridge,
    };
}
