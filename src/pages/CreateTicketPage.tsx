import { useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTickets } from '../hooks/useTickets';
import { useMasters } from '../hooks/useMasters';
import { useApp } from '../context/useApp';
import TicketListView from '../components/TicketListView';
import TicketForm from '../components/TicketForm';
import type { Ticket } from '../types';

export default function CreateTicketPage() {
    const { tickets, addTicket, updateTicket, approveTicket, deleteTicket, mockFetchWeighbridge } = useTickets();
    const { products, vendors, vehicles } = useMasters();
    const { t } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });

    const handleFormOpen = (ticket?: Ticket) => {
        if (ticket) {
            setEditingTicket(ticket);
        } else {
            setEditingTicket(null);
        }
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Partial<Ticket>) => {
        setIsFormOpen(false);
        if (editingTicket) {
            updateTicket(editingTicket.id, data);
            setSnackbar({ open: true, message: t('ticket.msg.saved'), severity: 'success' });
        } else {
            addTicket(data as Omit<Ticket, 'id' | 'createdAt'>);
            setSnackbar({ open: true, message: t('ticket.msg.saved'), severity: 'success' });
        }
    };

    const handleAutoCreate = () => {
        mockFetchWeighbridge();
        setSnackbar({ open: true, message: 'New data pulled from weighbridge', severity: 'success' });
    };

    const handleApprove = (id: string) => {
        approveTicket(id);
        setSnackbar({ open: true, message: t('ticket.msg.approved'), severity: 'success' });
    };

    return (
        <Box sx={{ height: 'calc(100vh - 80px)', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', pt: { xs: 2, md: 4 }, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: { xs: 2, md: 4 }, width: '100%' }}>
                <Typography variant="h4" fontWeight={800} color="#1e293b">
                    {t('ticket.title')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleAutoCreate}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                        Auto-Create
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleFormOpen()}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
                        }}
                    >
                        {t('ticket.create')}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden', px: { xs: 2, md: 4 }, pb: 2 }}>
                <Paper elevation={0} sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <TicketListView
                        tickets={tickets}
                        onApprove={handleApprove}
                        onEdit={handleFormOpen}
                        onDelete={deleteTicket}
                    />
                </Paper>
            </Box>

            <TicketForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                editingTicket={editingTicket}
                products={products}
                vendors={vendors}
                vehicles={vehicles}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 3, fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
