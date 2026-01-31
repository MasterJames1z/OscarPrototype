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
    alpha,
    useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { useApp } from '../context/useApp';
import { useAuth } from '../context/AuthContext';
import type { Ticket, ResourceOption, PaymentType, Product, Vendor, Vehicle } from '../types';
import { authFetch } from '../utils/api';

interface TicketFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Ticket>) => void;
    editingTicket?: Ticket | null;
    getTodayPrice: (resourceName: string) => number; // Keep for compatibility, though we fetch API
    products: Product[]; // Needed for ProductID
    vendors: Vendor[];   // Needed for VendorID
    vehicles: Vehicle[]; // Needed for VehicleID
}

const INITIAL_STATE: Partial<Ticket> = {
    ticketNumber: '',
    resourceName: '',
    paymentType: 'cash',
    sellerName: '',
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
    getTodayPrice,
    products, vendors, vehicles
}: TicketFormProps) {
    const { t } = useApp();
    const theme = useTheme();
    const [formData, setFormData] = useState<Partial<Ticket>>(INITIAL_STATE);
    const { user } = useAuth();

    const [activePriceInfo, setActivePriceInfo] = useState<{ id: number; start: string; end?: string; price: number } | null>(null);

    // Fetch active price from API when ProductID changes (Preferred method)
    useEffect(() => {
        const fetchActivePrice = async () => {
            if (formData.ProductID && !editingTicket) {
                try {
                    const response = await authFetch(
                        `/product-prices/active/${formData.ProductID}?date=${dayjs().format('YYYY-MM-DD')}`
                    );
                    if (response.ok) {
                        const priceData = await response.json();
                        setFormData(prev => ({ ...prev, unitPrice: priceData.UnitPrice }));
                        setActivePriceInfo({
                            id: priceData.PriceID,
                            price: priceData.UnitPrice,
                            start: priceData.EffectiveDate,
                            end: priceData.ToDate
                        });
                    } else {
                        setFormData(prev => ({ ...prev, unitPrice: 0 }));
                        setActivePriceInfo(null);
                    }
                } catch (err) {
                    console.error('Failed to fetch active price:', err);
                    setFormData(prev => ({ ...prev, unitPrice: 0 }));
                    setActivePriceInfo(null);
                }
            }
        };
        fetchActivePrice();
    }, [formData.ProductID, editingTicket]);

    // Fallback: update price if resourceName changes (Legacy support)
    useEffect(() => {
        if (formData.resourceName && !formData.ProductID && !editingTicket) {
            // Try to find product ID from name lookup
            const product = products.find(p => p.ProductName === formData.resourceName);
            if (product) {
                setFormData(prev => ({ ...prev, ProductID: product.ProductID }));
            } else {
                // Fallback to prop function if no API lookup possible
                const price = getTodayPrice(formData.resourceName);
                setFormData(prev => ({ ...prev, unitPrice: price }));
            }
        }
    }, [formData.resourceName, formData.ProductID, products, getTodayPrice, editingTicket]);

    useEffect(() => {
        if (editingTicket) {
            setFormData(editingTicket);
        } else {
            setFormData({
                ...INITIAL_STATE,
                paymentType: 'cash',
                ticketNumber: `00000${Math.floor(25000 + Math.random() * 5000)}`,
                createdBy: user ? `${user.firstname} ${user.lastname}` : 'Admin_System',
                entryDateTime: dayjs().format('DD/MM/YYYY HH:mm:ss'),
                exitDateTime: dayjs().add(25, 'minute').format('DD/MM/YYYY HH:mm:ss'),
            });
        }
    }, [editingTicket, open, user]);

    const calculations = useMemo(() => {
        const net = (formData.weightIn || 0) - (formData.weightOut || 0);
        const impurity = formData.impurity || 0;
        const moisture = formData.moisture || 0;
        const deducted = Math.floor(net * (impurity + moisture) / 100);
        const remaining = net - deducted;
        const total = remaining * (formData.unitPrice || 0);

        return { net, deducted, remaining, total };
    }, [formData.weightIn, formData.weightOut, formData.impurity, formData.moisture, formData.unitPrice]);

    const handleSubmit = (statusOverride?: 'approved' | 'pending') => {
        onSubmit({
            ...formData,
            netWeight: calculations.net,
            deductedWeight: calculations.deducted,
            remainingWeight: calculations.remaining,
            totalPrice: calculations.total,
            status: statusOverride || editingTicket?.status || 'pending'
        });
        onClose();
    };

    const resourceOptions: ResourceOption[] = products.map(p => ({ label: p.ProductName, value: p.ProductName }));
    const vendorOptions = vendors.map(v => v.VendorName);
    const vehicleOptions = vehicles.map(v => v.LicensePlate);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, bgcolor: '#f8fafc' }
            }}
        >
            <Box sx={{ p: 4 }}>
                {/* Header Section */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h5" fontWeight={800} color="#1e293b" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 4, height: 24, bgcolor: '#3b82f6', mr: 2, borderRadius: 1 }} />
                            บัตรชั่งน้ำหนัก (Weigh Ticket)
                        </Typography>
                        <Typography variant="body2" color="#64748b" fontWeight={600}>
                            เลขที่ตั๋ว: <span style={{ color: '#3b82f6', marginRight: '16px' }}>{formData.ticketNumber}</span>
                            {formData.poNumber && (
                                <>
                                    หมายเลข PO: <span style={{ color: '#ed6c02' }}>{formData.poNumber}</span>
                                </>
                            )}
                        </Typography>
                    </Box>
                    {editingTicket && (
                        <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                            <Typography variant="caption" fontWeight={700} color="primary.main">
                                TICKET ID: #{editingTicket.id}
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* Transportation & Customer Section */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ width: 3, height: 16, bgcolor: '#3b82f6', mr: 1.5, borderRadius: 1 }} />
                        ข้อมูลการขนส่งและลูกค้า
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            options={vehicleOptions}
                            value={formData.licensePlate}
                            onChange={(_, newValue) => {
                                const selectedVehicle = vehicles.find(v => v.LicensePlate === newValue);
                                setFormData({
                                    ...formData,
                                    licensePlate: newValue || '',
                                    VehicleID: selectedVehicle?.VehicleID
                                });
                            }}
                            renderInput={(params) => <TextField {...params} label={t('ticket.licensePlate')} size="small" />}
                        />
                        <TextField
                            label={t('ticket.vehicleType')}
                            value={formData.vehicleType || ''}
                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                            variant="outlined"
                            size="small"
                        />
                        <ToggleButtonGroup
                            value={formData.paymentType}
                            exclusive
                            onChange={(_, val) => val && setFormData({ ...formData, paymentType: val as PaymentType })}
                            size="small"
                            fullWidth
                        >
                            <ToggleButton value="cash" sx={{ textTransform: 'none', fontWeight: 700 }}>{t('ticket.payment.cash')}</ToggleButton>
                            <ToggleButton value="po" sx={{ textTransform: 'none', fontWeight: 700 }}>{t('ticket.payment.po')}</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            options={vendorOptions}
                            value={formData.sellerName}
                            onChange={(_, newValue) => {
                                const selectedVendor = vendors.find(v => v.VendorName === newValue);
                                setFormData({
                                    ...formData,
                                    sellerName: newValue || '',
                                    VendorID: selectedVendor?.VendorID
                                });
                            }}
                            renderInput={(params) => <TextField {...params} label={t('ticket.seller')} size="small" />}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 2 }}>
                        <Autocomplete
                            options={resourceOptions}
                            getOptionLabel={(option) => option.label}
                            value={resourceOptions.find(o => o.value === formData.resourceName) || null}
                            onChange={(_, newValue) => {
                                const selectedProduct = products.find(p => p.ProductName === newValue?.value);
                                setFormData({
                                    ...formData,
                                    resourceName: newValue?.value || '',
                                    ProductID: selectedProduct?.ProductID
                                });
                            }}
                            renderInput={(params) => <TextField {...params} label={t('ticket.product')} size="small" fullWidth />}
                        />
                    </Box>

                    {activePriceInfo && (
                        <Box sx={{ bgcolor: alpha('#3b82f6', 0.05), p: 2, borderRadius: 2, mb: 2, border: '1px dashed', borderColor: alpha('#3b82f6', 0.3) }}>
                            <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 700, display: 'block', mb: 0.5 }}>
                                ดึงข้อมูลราคาจาก Price ID: #{activePriceInfo.id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                ราคา: ฿{activePriceInfo.price} | มีผลตั้งแต่วันที่: {dayjs(activePriceInfo.start).format('DD/MM/YYYY')} - {activePriceInfo.end ? dayjs(activePriceInfo.end).format('DD/MM/YYYY') : 'ไม่มีกำหนด'}
                            </Typography>
                        </Box>
                    )}

                    {!activePriceInfo && formData.ProductID ? (
                        <Box sx={{ bgcolor: alpha('#ef4444', 0.05), p: 2, borderRadius: 2, mb: 2, border: '1px dashed', borderColor: alpha('#ef4444', 0.3) }}>
                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, display: 'block' }}>
                                ⚠️ ไม่พบข้อมูลราคาสำหรับสินค้านี้
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                กรุณาเพิ่มข้อมูลราคาที่หน้า "จัดการราคา" (Create Price) ก่อนทำรายการ
                            </Typography>
                        </Box>
                    ) : null}

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="#64748b" sx={{ mb: 1, display: 'block', fontWeight: 700 }}>{t('ticket.remarks')}</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.remarks || ''}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                </Paper>

                {/* Weight Cards Section */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                    <Paper elevation={0} sx={{ p: 0, borderRadius: 3, overflow: 'hidden', borderLeft: '5px solid #3b82f6', border: '1px solid #e2e8f0' }}>
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" gutterBottom>เวลาและน้ำหนักขาเข้า</Typography>
                            <Typography variant="caption" color="#64748b" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                วันที่-เวลา เข้า: <span>{formData.entryDateTime}</span>
                            </Typography>
                        </Box>
                        <Box sx={{ p: 3, bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="#3b82f6" fontWeight={700}>น้ำหนักเข้า (Weight In)</Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 1,
                                    borderBottom: '2px dashed',
                                    borderColor: alpha('#3b82f6', 0.3),
                                    transition: 'all 0.2s',
                                    cursor: 'text',
                                    borderRadius: '4px 4px 0 0',
                                    '&:hover': {
                                        bgcolor: alpha('#3b82f6', 0.05),
                                        borderColor: '#3b82f6'
                                    }
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
                                    gap: 1,
                                    borderBottom: '2px dashed',
                                    borderColor: alpha('#f97316', 0.3),
                                    transition: 'all 0.2s',
                                    cursor: 'text',
                                    borderRadius: '4px 4px 0 0',
                                    '&:hover': {
                                        bgcolor: alpha('#f97316', 0.05),
                                        borderColor: '#f97316'
                                    }
                                }}>
                                    <TextField
                                        variant="standard"
                                        type="number"
                                        value={formData.weightOut || ''}
                                        onChange={(e) => setFormData({ ...formData, weightOut: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        InputProps={{ disableUnderline: true }}
                                        sx={{
                                            width: '100%',
                                            '& input': { p: 0.5, fontWeight: 800, fontSize: '3rem', color: '#7c2d12' }
                                        }}
                                    />
                                    <Typography variant="h6" fontWeight={600} color="#7c2d12" sx={{ pl: 1, pr: 1 }}>กก.</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* Summary Bar Section */}
                <Box sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 3,
                    mb: 3,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    color: 'text.primary',
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1)
                }}>
                    <Box sx={{ borderRight: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('ticket.netWeight')}</Typography>
                        <Typography variant="h4" fontWeight={800} color="primary.main">
                            {calculations.net.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>กก.</span>
                        </Typography>
                    </Box>
                    <Box sx={{ borderRight: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>ราคาต่อหน่วย</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
                            <TextField
                                size="small"
                                variant="standard"
                                type="number"
                                value={formData.unitPrice || ''}
                                // onChange removed to make it read-only
                                InputProps={{
                                    readOnly: true,
                                    disableUnderline: true
                                }}
                                sx={{
                                    width: 80,
                                    '& input': { textAlign: 'right', p: 0, fontWeight: 800, fontSize: '2rem', color: 'primary.main' }
                                }}
                            />
                            <Typography variant="h5" fontWeight={600} color="primary.dark">บาท</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('ticket.totalPrice')}</Typography>
                        <Typography variant="h4" fontWeight={800} color="#ed6c02">
                            {calculations.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '0.8rem' }}>บาท</span>
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.5), pt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="body2" color="#64748b" fontWeight={600}>
                                ผู้บันทึกรายการ: <span style={{ color: '#1e293b' }}>{formData.createdBy}</span>
                            </Typography>
                        </Box>
                    </Box>

                    <Stack spacing={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => handleSubmit()}
                            disabled={!activePriceInfo && !editingTicket}
                            sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                        >
                            {t('ticket.btnSave')}
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => handleSubmit('approved')}
                            disabled={!activePriceInfo && !editingTicket}
                            sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, bgcolor: 'primary.main', fontSize: '1.1rem', boxShadow: '0 8px 16px -4px rgba(26, 51, 126, 0.3)', '&:hover': { bgcolor: '#10265a' } }}
                        >
                            Save & Approve
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, borderColor: alpha(theme.palette.divider, 0.5), color: 'text.secondary' }}
                        >
                            {t('ticket.btnPrint')}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Dialog>
    );
}
