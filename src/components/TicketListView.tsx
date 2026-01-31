import {
    Box,
    Tabs,
    Tab,
    Typography,
    Stack,
    alpha,
    IconButton,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
} from '@mui/material';
import {
    ViewModule as CardViewIcon,
    ViewList as ListViewIcon,
    Search as SearchIcon,
    EditOutlined as EditIcon,
    DeleteOutline as DeleteIcon,
    CheckCircleOutline as ApproveIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import type { Ticket } from '../types';
import TicketCard from './TicketCard';
import { useApp } from '../context/useApp';
import { useMasters } from '../hooks/useMasters';

interface TicketListViewProps {
    tickets: Ticket[];
    onApprove: (id: string) => void;
    onEdit: (ticket: Ticket) => void;
    onDelete: (id: string) => void;
}

type TabValue = 'all' | 'pending' | 'approved';
type ViewMode = 'card' | 'list';

export default function TicketListView({ tickets, onApprove, onEdit, onDelete }: TicketListViewProps) {
    const { t } = useApp();
    const { products } = useMasters();
    const [tab, setTab] = useState<TabValue>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('card');
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'po'>('all');
    const [resourceFilter, setResourceFilter] = useState('all');

    const filteredTickets = tickets.filter(ticket => {
        const matchesTab = tab === 'all' || ticket.status === tab;
        const searchStr = `${ticket.ticketNumber} ${ticket.resourceName} ${ticket.sellerName} ${ticket.licensePlate} ${ticket.poNumber || ''}`.toLowerCase();
        const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
        const matchesPayment = paymentFilter === 'all' || ticket.paymentType === paymentFilter;
        const matchesResource = resourceFilter === 'all' || ticket.resourceName === resourceFilter;
        return matchesTab && matchesSearch && matchesPayment && matchesResource;
    });

    const getStatusConfig = (status: Ticket['status']) => {
        switch (status) {
            case 'approved': return { color: '#2e7d32', label: t('ticket.status.approved') };
            case 'pending': return { color: '#ed6c02', label: t('ticket.status.pending') };
            default: return { color: '#94a3b8', label: t('ticket.status.draft') };
        }
    };

    const renderTableView = () => (
        <TableContainer sx={{ height: '100%' }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper' }}>เลขที่ตั๋ว / วันที่</TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper' }}>สินค้า / ที่มา</TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper' }}>ผู้ขาย / ทะเบียน</TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', textAlign: 'right' }}>น้ำหนักสุทธิ</TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', textAlign: 'right' }}>ราคาต่อหน่วย</TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', textAlign: 'right' }}>จำนวนเงิน</TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', textAlign: 'center' }}>สถานะ</TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper', textAlign: 'center' }}>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredTickets.map((ticket) => {
                        const config = getStatusConfig(ticket.status);
                        return (
                            <TableRow key={ticket.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={700} color="primary.main">{ticket.ticketNumber}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={700}>{ticket.resourceName}</Typography>
                                        <Chip
                                            label={ticket.type?.toUpperCase()}
                                            size="small"
                                            sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, borderRadius: 1, bgcolor: alpha(ticket.type === 'auto' ? '#1a337e' : '#94a3b8', 0.1), color: ticket.type === 'auto' ? '#1a337e' : '#64748b' }}
                                        />
                                    </Box>
                                    {ticket.poNumber && <Typography variant="caption" color="warning.main" fontWeight={700}>PO: {ticket.poNumber}</Typography>}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{ticket.sellerName || 'N/A'}</Typography>
                                    <Typography variant="caption" color="text.secondary">{ticket.licensePlate || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                                    {(ticket.netWeight || 0).toLocaleString()} kg
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: 'primary.main' }}>
                                    ฿{(ticket.unitPrice || 0).toLocaleString()}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right', fontWeight: 800, color: 'success.main' }}>
                                    ฿{(ticket.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <Chip
                                        label={config.label}
                                        size="small"
                                        sx={{ bgcolor: alpha(config.color, 0.1), color: config.color, fontWeight: 700, borderRadius: 1.5 }}
                                    />
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                        {ticket.status !== 'approved' && (
                                            <Tooltip title="Approve Ticket">
                                                <IconButton size="small" onClick={() => onApprove(ticket.id)} sx={{ color: 'success.main' }}>
                                                    <ApproveIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {ticket.status !== 'approved' && (
                                            <Tooltip title="Edit Ticket">
                                                <IconButton size="small" onClick={() => onEdit(ticket)} sx={{ color: 'text.secondary' }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {ticket.type !== 'auto' && ticket.status !== 'approved' && (
                                            <Tooltip title="Delete Ticket">
                                                <IconButton size="small" onClick={() => onDelete(ticket.id)} sx={{ color: 'error.light' }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Top View Selector Tabs */}
            <Box sx={{ px: 2, borderBottom: '1px solid', borderColor: alpha('#1a337e', 0.1) }}>
                <Tabs
                    value={viewMode}
                    onChange={(_, v) => setViewMode(v)}
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#1a337e' },
                        '& .MuiTab-root': {
                            minHeight: 48,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#64748b',
                            '&.Mui-selected': { color: '#1a337e' },
                            flexDirection: 'row',
                            gap: 1
                        }
                    }}
                >
                    <Tab icon={<ListViewIcon sx={{ fontSize: 20 }} />} label="List View" value="list" />
                    <Tab icon={<CardViewIcon sx={{ fontSize: 20 }} />} label="Card View" value="card" />
                </Tabs>
            </Box>

            {/* Search and Filters Row */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#1a337e', 0.05) }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
                    <TextField
                        fullWidth
                        placeholder="ค้นหา..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 200,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: '#fff',
                                '& fieldset': { borderColor: '#e2e8f0' }
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: '#fff' }}>
                        <InputLabel sx={{ fontWeight: 600 }}>Status</InputLabel>
                        <Select
                            value={tab}
                            label="Status"
                            onChange={(e) => setTab(e.target.value as any)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180, bgcolor: '#fff' }}>
                        <InputLabel sx={{ fontWeight: 600 }}>Payment Type</InputLabel>
                        <Select
                            value={paymentFilter}
                            label="Payment Type"
                            onChange={(e) => setPaymentFilter(e.target.value as any)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="po">PO</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200, bgcolor: '#fff' }}>
                        <InputLabel sx={{ fontWeight: 600 }}>Resource</InputLabel>
                        <Select
                            value={resourceFilter}
                            label="Resource"
                            onChange={(e) => setResourceFilter(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            {products.map(p => (
                                <MenuItem key={p.ProductID} value={p.ProductName}>{p.ProductName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Box>

            {/* Content Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: viewMode === 'card' ? { xs: 2, md: 3 } : 0 }}>
                {filteredTickets.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 10, opacity: 0.5 }}>
                        <Typography variant="h6">{t('nav.help') || 'No data found'}</Typography>
                    </Stack>
                ) : viewMode === 'card' ? (
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
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </Box>
                ) : (
                    renderTableView()
                )}
            </Box>
        </Box>
    );
}
