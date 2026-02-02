import { useState, useCallback, useEffect } from 'react';
import type { Ticket } from '../types';

import { authFetch } from '../utils/api';


export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await authFetch('/tickets');
            if (!response.ok) throw new Error('Failed to fetch tickets');
            const data = await response.json();

            // Map DB fields to Frontend interface
            const mappedTickets: Ticket[] = data.map((t: any) => ({
                id: t.TicketID.toString(),
                ticketNumber: t.TicketNo,
                type: 'manual', // Default or logical check
                paymentType: t.PaymentType?.toLowerCase() || 'cash',
                resourceName: t.ProductName || 'N/A',
                sellerName: t.VendorName || 'N/A',
                licensePlate: t.LicensePlate || 'N/A',
                weightIn: t.WeightIn,
                weightOut: t.WeightOut,
                netWeight: t.NetWeight,
                entryDateTime: t.TimeIn,
                exitDateTime: t.TimeOut,
                impurity: 0, // Calculated or DB field
                moisture: 0, // Calculated or DB field
                deductedWeight: 0,
                remainingWeight: t.NetWeight,
                unitPrice: t.UnitPrice,
                totalPrice: t.TotalPrice,
                poNumber: t.TicketNo.startsWith('PO') ? t.TicketNo : undefined, // Mapping example
                status: t.ProcessStatus?.toLowerCase() || 'pending',
                remarks: t.Remarks,
                createdAt: t.TimeIn,
                createdBy: t.CreatedBy,

                // SAP Fields Mapping
                SAP_NumAtCard: t.SAP_NumAtCard,
                SAP_TaxDate: t.SAP_TaxDate ? t.SAP_TaxDate.split('T')[0] : '',
                SAP_CardCode: t.SAP_CardCode,
                SAP_Address: t.SAP_Address,
                SAP_Address2: t.SAP_Address2,
                SAP_DBName: t.SAP_DBName,
                SAP_RefNo: t.SAP_RefNo,
                SAP_BaseLine: t.SAP_BaseLine,
                SAP_BaseRef: t.SAP_BaseRef,
                SAP_BaseType: t.SAP_BaseType,
                SAP_Comments: t.SAP_Comments,
                SAP_DocEntry: t.SAP_DocEntry,
                SAP_DocNum: t.SAP_DocNum,
                SAP_DueDate: t.SAP_DueDate ? t.SAP_DueDate.split('T')[0] : '',
                SAP_PostingDate: t.SAP_PostingDate ? t.SAP_PostingDate.split('T')[0] : '',
                VatAmount: t.VatAmount,
                GrandTotal: t.GrandTotal,
                GrossPrice: t.GrossPrice,
                LineNum: t.LineNum,
                ItemCode: t.ItemCode,
                ItemName: t.ItemName,
                UnitMsr: t.UnitMsr,
                TaxCode: t.TaxCode,
                WhsCode: t.WhsCode,
                BranchCode: t.BranchCode,
                DeptCode: t.DeptCode,
                ProjectCode: t.ProjectCode,
                VehicleID: t.VehicleID
            }));

            setTickets(mappedTickets);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const addTicket = useCallback(async (ticket: Omit<Ticket, 'id' | 'createdAt'>) => {
        try {
            const response = await authFetch('/tickets', {
                method: 'POST',
                body: JSON.stringify({
                    TicketNo: ticket.ticketNumber,
                    VehicleID: ticket.VehicleID,
                    VendorID: ticket.VendorID,
                    ProductID: ticket.ProductID,
                    PaymentType: ticket.paymentType,
                    WeightIn: ticket.weightIn,
                    WeightOut: ticket.weightOut,
                    UnitPrice: ticket.unitPrice,
                    CreatedBy: ticket.createdBy,
                    Remarks: ticket.remarks,

                    // SAP Fields
                    SAP_NumAtCard: ticket.SAP_NumAtCard,
                    SAP_TaxDate: ticket.SAP_TaxDate,
                    SAP_CardCode: ticket.SAP_CardCode,
                    SAP_Address: ticket.SAP_Address,
                    SAP_Address2: ticket.SAP_Address2,
                    SAP_DBName: ticket.SAP_DBName,
                    SAP_RefNo: ticket.SAP_RefNo || ticket.ticketNumber,
                    SAP_BaseLine: ticket.SAP_BaseLine,
                    SAP_BaseRef: ticket.SAP_BaseRef,
                    SAP_BaseType: ticket.SAP_BaseType,
                    SAP_Comments: ticket.SAP_Comments,
                    SAP_DocEntry: ticket.SAP_DocEntry,
                    SAP_DocNum: ticket.SAP_DocNum,
                    SAP_DueDate: ticket.SAP_DueDate,
                    SAP_PostingDate: ticket.SAP_PostingDate,

                    // Amounts & Codes
                    VatAmount: ticket.VatAmount,
                    GrandTotal: ticket.GrandTotal,
                    GrossPrice: ticket.GrossPrice,
                    LineNum: ticket.LineNum,
                    ItemCode: ticket.ItemCode,
                    ItemName: ticket.ItemName,
                    UnitMsr: ticket.UnitMsr,
                    TaxCode: ticket.TaxCode,
                    WhsCode: ticket.WhsCode,
                    BranchCode: ticket.BranchCode,
                    DeptCode: ticket.DeptCode,
                    ProjectCode: ticket.ProjectCode
                }),
            });
            if (!response.ok) throw new Error('Failed to create ticket');
            await fetchTickets();
        } catch (err: any) {
            setError(err.message);
        }
    }, [fetchTickets]);

    const updateTicket = useCallback(async (_id: string, updates: Partial<Ticket>) => {
        // Implementation for general update if needed
        console.log('Update logic needed for', _id, updates);
    }, []);

    const approveTicket = useCallback(async (id: string) => {
        try {
            const response = await authFetch(`/tickets/${id}/approve`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error('Failed to approve ticket');
            await fetchTickets();
        } catch (err: any) {
            setError(err.message);
        }
    }, [fetchTickets]);

    const deleteTicket = useCallback(async (_id: string) => {
        // Not implemented in backend yet as per safety rules mentioned before
        console.warn('Delete not implemented on server yet');
    }, []);

    const mockFetchWeighbridge = useCallback(async () => {
        // This could call a "sync" endpoint or just re-fetch
        await fetchTickets();
    }, [fetchTickets]);

    return {
        tickets,
        loading,
        error,
        addTicket,
        updateTicket,
        approveTicket,
        deleteTicket,
        mockFetchWeighbridge,
        refresh: fetchTickets,
    };
}
