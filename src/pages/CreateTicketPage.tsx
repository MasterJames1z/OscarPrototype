import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Stack,
    Snackbar,
    Alert,
    alpha,
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTickets } from '../hooks/useTickets';
import { usePriceCards } from '../hooks/usePriceCards';
import { useApp } from '../context/useApp';
import TicketListView from '../components/TicketListView';
import TicketForm from '../components/TicketForm';
import type { Ticket } from '../types';

export default function CreateTicketPage() {
    const { tickets, addTicket, updateTicket, approveTicket, deleteTicket, mockFetchWeighbridge } = useTickets();
    const { allResources, getTodayPrice } = usePriceCards();
    const { t } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const handleFormOpen = (ticket: Ticket | null = null) => {
        setEditingTicket(ticket);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Partial<Ticket>) => {
        if (editingTicket) {
            updateTicket(editingTicket.id, data);
            setSnackbar({ open: true, message: t('ticket.msg.saved'), severity: 'success' });
        } else {
            addTicket(data as Omit<Ticket, 'id' | 'createdAt'>);
            setSnackbar({ open: true, message: t('ticket.msg.saved'), severity: 'success' });
        }
    };

    const handleAutoCreate = () => {
        mockFetchWeighbridge(getTodayPrice);
        setSnackbar({ open: true, message: 'New data pulled from weighbridge', severity: 'success' });
    };

    const handleApprove = (id: string) => {
        approveTicket(id);
        setSnackbar({ open: true, message: t('ticket.msg.approved'), severity: 'success' });
    };

    return (
        <Box sx={{ height: 'calc(100vh - 80px)', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', pt: { xs: 2, md: 4 }, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: { xs: 2, md: 4 }, width: '100%' }}>
                <Typography variant="h4" sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    letterSpacing: -0.5,
                    fontSize: { xs: '1.25rem', md: '1.75rem' }
                }}>
                    {t('ticket.title')}
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleAutoCreate}
                        sx={{
                            borderRadius: 3,
                            px: { xs: 1.5, md: 3 },
                            py: 1,
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            fontWeight: 700,
                        }}
                    >
                        {t('ticket.btnAuto')}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleFormOpen()}
                        sx={{
                            borderRadius: 3,
                            px: { xs: 1.5, md: 3 },
                            py: 1,
                            bgcolor: 'primary.main',
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#142a66' }
                        }}
                    >
                        {t('ticket.btnManual')}
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden', width: '100%', px: { xs: 1, sm: 2, md: 4 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: { xs: 3, md: 5 },
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: alpha('#1a337e', 0.1),
                    }}
                >
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
                allResources={allResources}
                getTodayPrice={getTodayPrice}
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
