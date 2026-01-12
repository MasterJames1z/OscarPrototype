import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
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
        const resources = [
            'Rubber Wood - Grade A',
            'Rubber Wood - Grade B',
            'Rubber Wood - Grade C',
            'Eucalyptus',
            'Acacia',
        ];
        const sellers = ['บริษัท ภัทรพาราวูด ทุ่งใหญ่ จำกัด', 'นางวิลัยวรรณ ไกรนรา', 'นายสมชาย รักสงบ'];
        const plates = ['82-3572 นศ', '82-2838 นศ', '70-1234 กทม'];
        const vehicles = ['รถสิบล้อพ่วง', 'รถหกล้อ', 'รถหัวลาก'];

        const randomResource = resources[Math.floor(Math.random() * resources.length)];
        const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];
        const randomPlate = plates[Math.floor(Math.random() * plates.length)];
        const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        const paymentType = Math.random() > 0.5 ? 'cash' : 'po';

        const weightIn = 15000 + Math.floor(Math.random() * 35000);
        const weightOut = 5000 + Math.floor(Math.random() * 10000);
        const netWeight = weightIn - weightOut;

        const entryDate = dayjs().subtract(30, 'minute');
        const exitDate = dayjs();

        const impurity = Math.floor(Math.random() * 2); // 0 or 1%
        const moisture = Math.floor(Math.random() * 5); // 0-4%
        const deductedWeight = Math.floor(netWeight * (impurity + moisture) / 100);
        const remainingWeight = netWeight - deductedWeight;

        const unitPrice = getPrice ? getPrice(randomResource) : (1.1 + Math.random() * 1.5);
        const totalPrice = (remainingWeight) * unitPrice;

        const newTicket: Ticket = {
            id: uuidv4(),
            ticketNumber: `00000${Math.floor(25000 + Math.random() * 5000)}`,
            type: 'auto',
            paymentType,
            resourceName: randomResource,
            sellerName: randomSeller,
            licensePlate: randomPlate,
            vehicleType: randomVehicle,
            weightIn,
            weightOut,
            netWeight,
            entryDateTime: entryDate.format('DD/MM/YYYY HH:mm:ss'),
            exitDateTime: exitDate.format('DD/MM/YYYY HH:mm:ss'),
            impurity,
            moisture,
            deductedWeight,
            remainingWeight,
            unitPrice,
            totalPrice,
            poNumber: paymentType === 'po' ? `PO${dayjs().format('YYMMDD')}${Math.floor(Math.random() * 1000)}` : undefined,
            status: 'pending',
            remarks: '-',
            createdAt: new Date().toISOString(),
            createdBy: 'Admin_System',
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
