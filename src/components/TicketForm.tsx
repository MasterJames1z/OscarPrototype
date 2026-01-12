import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Typography,
    Box,
    alpha,
} from '@mui/material';
import { useApp } from '../context/useApp';
import type { Ticket, ResourceOption } from '../types';

interface TicketFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Ticket>) => void;
    editingTicket?: Ticket | null;
    allResources: string[];
    getTodayPrice: (resourceName: string) => number;
}

const INITIAL_STATE: Partial<Ticket> = {
    ticketNumber: '',
    resourceName: '',
    weightIn: 0,
    weightOut: 0,
    netWeight: 0,
    unitPrice: 0,
    totalPrice: 0,
    type: 'manual',
    status: 'pending',
};

export default function TicketForm({ open, onClose, onSubmit, editingTicket, allResources, getTodayPrice }: TicketFormProps) {
    const { t } = useApp();
    const [formData, setFormData] = useState<Partial<Ticket>>(INITIAL_STATE);

    useEffect(() => {
        if (formData.resourceName && !editingTicket) {
            const price = getTodayPrice(formData.resourceName);
            setFormData(prev => ({ ...prev, unitPrice: price }));
        }
    }, [formData.resourceName, getTodayPrice, editingTicket]);

    useEffect(() => {
        if (editingTicket) {
            setFormData(editingTicket);
        } else {
            setFormData({
                ...INITIAL_STATE,
                ticketNumber: `M-${Math.floor(100000 + Math.random() * 900000)}`,
                createdBy: 'Manual Entry'
            });
        }
    }, [editingTicket, open]);

    const netWeight = (formData.weightIn || 0) - (formData.weightOut || 0);
    const totalPrice = (netWeight / 1000) * (formData.unitPrice || 0);

    const handleSubmit = () => {
        onSubmit({ ...formData, netWeight, totalPrice });
        onClose();
    };

    const resourceOptions: ResourceOption[] = allResources.map(r => ({ label: r, value: r }));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, color: 'primary.main' }}>
                {editingTicket ? t('form.editTitle') : t('ticket.title')}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mt: 1 }}>
                    <Box sx={{ gridColumn: 'span 12' }}>
                        <TextField
                            fullWidth
                            label={t('ticket.number')}
                            value={formData.ticketNumber}
                            disabled
                        />
                    </Box>
                    <Box sx={{ gridColumn: 'span 12' }}>
                        <Autocomplete
                            options={resourceOptions}
                            getOptionLabel={(option) => option.label}
                            value={resourceOptions.find(o => o.value === formData.resourceName) || null}
                            onChange={(_, newValue) => setFormData({ ...formData, resourceName: newValue?.value || '' })}
                            renderInput={(params) => <TextField {...params} label={t('form.resource')} required />}
                        />
                    </Box>
                    <Box sx={{ gridColumn: 'span 6' }}>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('ticket.weightIn')}
                            value={formData.weightIn || ''}
                            onChange={(e) => setFormData({ ...formData, weightIn: e.target.value === '' ? 0 : Number(e.target.value) })}
                        />
                    </Box>
                    <Box sx={{ gridColumn: 'span 6' }}>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('ticket.weightOut')}
                            value={formData.weightOut || ''}
                            onChange={(e) => setFormData({ ...formData, weightOut: e.target.value === '' ? 0 : Number(e.target.value) })}
                        />
                    </Box>
                    <Box sx={{ gridColumn: 'span 12' }}>
                        <Box sx={{ p: 2, bgcolor: alpha('#1a337e', 0.03), borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {t('ticket.netWeight')}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {netWeight.toLocaleString()} kg
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ gridColumn: 'span 6' }}>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('form.price')}
                            value={formData.unitPrice || ''}
                            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                        />
                    </Box>
                    <Box sx={{ gridColumn: 'span 12' }}>
                        <Box sx={{ p: 2, bgcolor: alpha('#2e7d32', 0.03), borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {t('ticket.totalPrice')}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color="success.main">
                                ฿{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">{t('form.cancel')}</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!formData.resourceName}>
                    {t('form.submitCreate')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
