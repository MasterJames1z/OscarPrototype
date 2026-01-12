import {
    Card,
    CardContent,
    Typography,
    Stack,
    Box,
    alpha,
    Chip,
    Button,
    IconButton,
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    CheckCircleOutline as ApprovedIcon,
    PendingActions as PendingIcon,
    EditOutlined as EditIcon,
    DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../context/useApp';
import type { Ticket } from '../types';

interface TicketCardProps {
    ticket: Ticket;
    onApprove: (id: string) => void;
    onEdit: (ticket: Ticket) => void;
    onDelete: (id: string) => void;
}

export default function TicketCard({ ticket, onApprove, onEdit, onDelete }: TicketCardProps) {
    const { t } = useApp();

    const getStatusConfig = (status: Ticket['status']) => {
        switch (status) {
            case 'approved':
                return { color: '#2e7d32', icon: <ApprovedIcon />, label: t('ticket.status.approved') };
            case 'pending':
                return { color: '#ed6c02', icon: <PendingIcon />, label: t('ticket.status.pending') };
            default:
                return { color: '#94a3b8', icon: <PendingIcon />, label: t('ticket.status.draft') };
        }
    };

    const config = getStatusConfig(ticket.status);

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha('#1a337e', 0.1),
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                }
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: alpha(ticket.type === 'auto' ? '#1a337e' : '#ed6c02', 0.05),
                        color: ticket.type === 'auto' ? 'primary.main' : '#ed6c02'
                    }}>
                        <ShippingIcon />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {ticket.ticketNumber}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
                            {ticket.resourceName}
                        </Typography>
                    </Box>
                    <Chip
                        icon={config.icon}
                        label={config.label}
                        size="small"
                        sx={{
                            bgcolor: alpha(config.color, 0.1),
                            color: config.color,
                            fontWeight: 700,
                            border: 'none'
                        }}
                    />
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">{t('ticket.netWeight')}</Typography>
                        <Typography variant="body1" fontWeight={700}>{ticket.netWeight.toLocaleString()} kg</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">{t('ticket.totalPrice')}</Typography>
                        <Typography variant="body1" fontWeight={700} color="success.main">
                            ฿{ticket.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={0.5}>
                        {ticket.status !== 'approved' && (
                            <IconButton size="small" onClick={() => onEdit(ticket)} sx={{ color: 'text.secondary' }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        )}
                        <IconButton size="small" onClick={() => onDelete(ticket.id)} sx={{ color: 'error.light' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>

                    {ticket.status === 'pending' && (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => onApprove(ticket.id)}
                            sx={{ borderRadius: 2, px: 2 }}
                        >
                            {t('ticket.action.approve')}
                        </Button>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
