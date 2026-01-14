import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    Button,
    TextField,
    Autocomplete,
    Typography,
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Paper,
    Stack,
} from '@mui/material';
import dayjs from 'dayjs';
import { useApp } from '../context/useApp';
import type { Ticket, Product, Vendor, Vehicle } from '../types';

interface TicketFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Ticket>) => void;
    editingTicket?: Ticket | null;
    products: Product[];
    vendors: Vendor[];
    vehicles: Vehicle[];
}

const INITIAL_STATE: Partial<Ticket> = {
    ticketNumber: '',
    licensePlate: '',
    weightIn: 0,
    weightOut: 0,
    impurity: 0,
    moisture: 0,
    unitPrice: 0,
    type: 'manual',
    status: 'pending',
};

export default function TicketForm({
    open, onClose, onSubmit, editingTicket,
    products, vendors, vehicles
}: TicketFormProps) {
    const { t } = useApp();
    const [formData, setFormData] = useState<Partial<Ticket>>(INITIAL_STATE);

    // Fetch active price when product is selected
    useEffect(() => {
        const fetchActivePrice = async () => {
            if (formData.ProductID && !editingTicket) {
                try {
                    // Use environment variable for API URL in production
                    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                    const response = await fetch(
                        `${apiUrl}/api/product-prices/active/${formData.ProductID}?date=${dayjs().format('YYYY-MM-DD')}`
                    );
                    if (response.ok) {
                        const priceData = await response.json();
                        setFormData(prev => ({ ...prev, unitPrice: priceData.UnitPrice }));
                    } else {
                        // No active price found, set to 0
                        setFormData(prev => ({ ...prev, unitPrice: 0 }));
                    }
                } catch (err) {
                    console.error('Failed to fetch active price:', err);
                    setFormData(prev => ({ ...prev, unitPrice: 0 }));
                }
            }
        };
        fetchActivePrice();
    }, [formData.ProductID, editingTicket]);

    useEffect(() => {
        if (editingTicket) {
            setFormData(editingTicket);
        } else {
            setFormData({
                ...INITIAL_STATE,
                paymentType: 'cash',
                ticketNumber: `00000${Math.floor(25000 + Math.random() * 5000)}`,
                createdBy: 'Admin_System',
                entryDateTime: dayjs().format('DD/MM/YYYY HH:mm:ss'),
                exitDateTime: dayjs().add(25, 'minute').format('DD/MM/YYYY HH:mm:ss'),
            });
        }
    }, [editingTicket, open]);

    const calculations = useMemo(() => {
        const net = (formData.weightIn || 0) - (formData.weightOut || 0);
        const impurity = formData.impurity || 0;
        const moisture = formData.moisture || 0;
        const deducted = Math.floor(net * (impurity + moisture) / 100);
        const remaining = net - deducted;
        const total = remaining * (formData.unitPrice || 0);

        return { net, deducted, remaining, total };
    }, [formData]);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 5, overflow: 'hidden' }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
                {/* Left Side: Form */}
                <Box sx={{ flex: 1, p: 4, bgcolor: '#f8fafc' }}>
                    <Typography variant="h5" fontWeight={800} color="#1e3a8a" sx={{ mb: 3 }}>
                        {editingTicket ? t('ticket.edit') : t('ticket.create')}
                    </Typography>

                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>รายละเอียดทั่วไป</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField
                                    label={t('ticket.number')}
                                    fullWidth
                                    value={formData.ticketNumber}
                                    disabled
                                    size="small"
                                />
                                <Box>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={formData.paymentType}
                                        exclusive
                                        onChange={(_, v) => v && setFormData({ ...formData, paymentType: v })}
                                        size="small"
                                        fullWidth
                                    >
                                        <ToggleButton value="cash" sx={{ textTransform: 'none', fontWeight: 700 }}>{t('ticket.payment.cash')}</ToggleButton>
                                        <ToggleButton value="po" sx={{ textTransform: 'none', fontWeight: 700 }}>{t('ticket.payment.po')}</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '6.5fr 3.5fr', gap: 2 }}>
                            <Autocomplete
                                options={vendors}
                                getOptionLabel={(option) => option.VendorName}
                                value={vendors.find(v => v.VendorName === formData.sellerName) || null}
                                onChange={(_, newValue) => setFormData({
                                    ...formData,
                                    sellerName: newValue?.VendorName || '',
                                    VendorID: newValue?.VendorID
                                })}
                                renderInput={(params) => <TextField {...params} label={t('ticket.seller')} size="small" />}
                            />
                            <Autocomplete
                                options={products}
                                getOptionLabel={(option) => option.ProductName}
                                value={products.find(p => p.ProductName === formData.resourceName) || null}
                                onChange={(_, newValue) => setFormData({
                                    ...formData,
                                    resourceName: newValue?.ProductName || '',
                                    ProductID: newValue?.ProductID
                                })}
                                renderInput={(params) => <TextField {...params} label={t('ticket.product')} size="small" />}
                            />
                        </Box>

                        <Autocomplete
                            freeSolo
                            options={vehicles}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.LicensePlate}
                            value={formData.licensePlate}
                            onChange={(_, newValue) => setFormData({
                                ...formData,
                                licensePlate: typeof newValue === 'string' ? newValue : (newValue?.LicensePlate || ''),
                                VehicleID: typeof newValue === 'string' ? undefined : newValue?.VehicleID
                            })}
                            renderInput={(params) => <TextField {...params} label={t('ticket.licensePlate')} fullWidth />}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label={`${t('ticket.weightIn')} (กก.)`}
                                type="number"
                                fullWidth
                                value={formData.weightIn}
                                onChange={(e) => setFormData({ ...formData, weightIn: Number(e.target.value) })}
                                InputProps={{
                                    endAdornment: <Typography variant="caption" color="text.secondary">กก.</Typography>
                                }}
                            />
                            <TextField
                                label={`${t('ticket.weightOut')} (กก.)`}
                                type="number"
                                fullWidth
                                value={formData.weightOut}
                                onChange={(e) => setFormData({ ...formData, weightOut: Number(e.target.value) })}
                                InputProps={{
                                    endAdornment: <Typography variant="caption" color="text.secondary">กก.</Typography>
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label={`${t('ticket.impurity')} (%)`}
                                type="number"
                                fullWidth
                                value={formData.impurity}
                                onChange={(e) => setFormData({ ...formData, impurity: Number(e.target.value) })}
                            />
                            <TextField
                                label={`${t('ticket.moisture')} (%)`}
                                type="number"
                                fullWidth
                                value={formData.moisture}
                                onChange={(e) => setFormData({ ...formData, moisture: Number(e.target.value) })}
                            />
                        </Box>
                    </Stack>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('ticket.cancel')}</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{
                                px: 4, py: 1,
                                borderRadius: 3,
                                backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
                                fontWeight: 700
                            }}
                        >
                            {t('ticket.save')}
                        </Button>
                    </Box>
                </Box>

                {/* Right Side: Summary Card */}
                <Box sx={{ width: { xs: '100%', md: 400 }, bgcolor: '#1e3a8a', color: '#fff', p: 4, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="overline" letterSpacing={2} sx={{ opacity: 0.7 }}>OSCAR AGRO</Typography>
                        <Typography variant="h4" fontWeight={900}>WEIGH TICKET</Typography>
                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>{formData.ticketNumber}</Typography>
                    </Box>

                    <Paper elevation={0} sx={{ p: 0, borderRadius: 3, overflow: 'hidden', mb: 3, borderLeft: '5px solid #4ade80' }}>
                        <Box sx={{ p: 2, bgcolor: '#fff' }}>
                            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" gutterBottom>น้ำหนักและราคา</Typography>
                            <Typography variant="caption" color="#64748b" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                วันที่-เวลา เข้า: <span>{formData.entryDateTime}</span>
                            </Typography>
                        </Box>
                        <Box sx={{ p: 3, bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="#166534" fontWeight={700}>น้ำหนักสุทธิ (Net Weight)</Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                }}>
                                    <TextField
                                        variant="standard"
                                        type="number"
                                        value={formData.weightIn || ''}
                                        onChange={(e) => setFormData({ ...formData, weightIn: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        InputProps={{ disableUnderline: true }}
                                        sx={{
                                            width: '100%',
                                            '& input': { p: 0.5, fontWeight: 800, fontSize: '3rem', color: '#1e3a8a' }
                                        }}
                                    />
                                    <Typography variant="h6" fontWeight={600} color="#1e3a8a" sx={{ pl: 1, pr: 1 }}>กก.</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 0, borderRadius: 3, overflow: 'hidden', borderLeft: '5px solid #f97316', border: '1px solid #e2e8f0' }}>
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" gutterBottom>เวลาและน้ำหนักขาออก</Typography>
                            <Typography variant="caption" color="#64748b" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                วันที่-เวลา ออก: <span>{formData.exitDateTime}</span>
                            </Typography>
                        </Box>
                        <Box sx={{ p: 3, bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="#f97316" fontWeight={700}>น้ำหนักรถเปล่า (Weight Out)</Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                }}>
                                    <Typography variant="h3" fontWeight={800} color="#c2410c">
                                        {(formData.weightOut || 0).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#9a3412' }}>กก.</span>
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                        <Box sx={{ borderRight: '1px solid #475569' }}>
                            <Typography variant="caption" color="#94a3b8">{t('ticket.netWeight')}</Typography>
                            <Typography variant="h4" fontWeight={800} color="#4ade80">
                                {calculations.net.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>กก.</span>
                            </Typography>
                        </Box>
                        <Box sx={{ borderRight: '1px solid #475569' }}>
                            <Typography variant="caption" color="#94a3b8">ราคาต่อหน่วย</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h4" fontWeight={800} color="#fff" sx={{ textAlign: 'right' }}>
                                    {(formData.unitPrice || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="h5" fontWeight={600}>บาท</Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#94a3b8">{t('ticket.totalPrice')}</Typography>
                            <Typography variant="h4" fontWeight={800} color="#facc15">
                                {calculations.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '0.8rem' }}>บาท</span>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Remarks Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 3 }}>
                        <Box sx={{ flexGrow: 1, mr: 4 }}>
                            <Typography variant="caption" color="#64748b" sx={{ mb: 1, display: 'block', fontWeight: 700 }}>{t('ticket.remarks')}</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.remarks || '-'}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                variant="outlined"
                                sx={{
                                    bgcolor: '#f8fafc',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#e2e8f0' },
                                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
