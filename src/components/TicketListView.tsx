import { Box, Tabs, Tab, Typography, Stack, alpha } from '@mui/material';
import { useState } from 'react';
import type { Ticket } from '../types';
import TicketCard from './TicketCard';
import { useApp } from '../context/useApp';

interface TicketListViewProps {
    tickets: Ticket[];
    onApprove: (id: string) => void;
    onEdit: (ticket: Ticket) => void;
    onDelete: (id: string) => void;
}

type TabValue = 'all' | 'pending' | 'approved';

export default function TicketListView({ tickets, onApprove, onEdit, onDelete }: TicketListViewProps) {
    const { t } = useApp();
    const [tab, setTab] = useState<TabValue>('all');

    const filteredTickets = tickets.filter(t => {
        if (tab === 'all') return true;
        return t.status === tab;
    });

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 2, borderBottom: '1px solid', borderColor: alpha('#1a337e', 0.1), mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                    }}
                >
                    <Tab label={t('status.all')} value="all" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    <Tab label={t('ticket.status.pending')} value="pending" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    <Tab label={t('ticket.status.approved')} value="approved" sx={{ fontWeight: 700, textTransform: 'none' }} />
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, pb: 4 }}>
                {filteredTickets.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 10, opacity: 0.5 }}>
                        <Typography variant="h6">{t('nav.help') || 'No data found'}</Typography>
                    </Stack>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                            md: 'repeat(auto-fill, minmax(350px, 1fr))'
                        },
                        gap: 3
                    }}>
                        {filteredTickets.map(ticket => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onApprove={onApprove}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
