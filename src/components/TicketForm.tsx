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
} from '@mui/material';
import dayjs from 'dayjs';
import { useApp } from '../context/useApp';
import type { Ticket, ResourceOption, PaymentType } from '../types';

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

    const resourceOptions: ResourceOption[] = allResources.map(r => ({ label: r, value: r }));

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
                <Box sx={{ mb: 3 }}>
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

                {/* Transportation & Customer Section */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ width: 3, height: 16, bgcolor: '#3b82f6', mr: 1.5, borderRadius: 1 }} />
                        ข้อมูลการขนส่งและลูกค้า
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                        <TextField
                            label={t('ticket.licensePlate')}
                            value={formData.licensePlate}
                            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                            variant="outlined"
                            size="small"
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

                    <Box sx={{ display: 'grid', gridTemplateColumns: '6.5fr 3.5fr', gap: 2 }}>
                        <TextField
                            label={t('ticket.seller')}
                            value={formData.sellerName}
                            onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                            variant="outlined"
                            size="small"
                        />
                        <Autocomplete
                            options={resourceOptions}
                            getOptionLabel={(option) => option.label}
                            value={resourceOptions.find(o => o.value === formData.resourceName) || null}
                            onChange={(_, newValue) => setFormData({ ...formData, resourceName: newValue?.value || '' })}
                            renderInput={(params) => <TextField {...params} label={t('ticket.product')} size="small" />}
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
                    bgcolor: '#1e293b',
                    borderRadius: 3,
                    mb: 3,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    color: '#fff',
                    textAlign: 'center'
                }}>
                    <Box sx={{ borderRight: '1px solid #475569' }}>
                        <Typography variant="caption" color="#94a3b8">{t('ticket.netWeight')}</Typography>
                        <Typography variant="h4" fontWeight={800} color="#4ade80">
                            {calculations.net.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>กก.</span>
                        </Typography>
                    </Box>
                    <Box sx={{ borderRight: '1px solid #475569' }}>
                        <Typography variant="caption" color="#94a3b8">ราคาต่อหน่วย</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
                            <TextField
                                size="small"
                                variant="standard"
                                type="number"
                                value={formData.unitPrice || ''}
                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                                InputProps={{ disableUnderline: true }}
                                sx={{
                                    width: 80,
                                    '& input': { textAlign: 'right', p: 0, fontWeight: 800, fontSize: '2rem', color: '#fff' }
                                }}
                            />
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1, mr: 4 }}>
                        <Typography variant="caption" color="#64748b" sx={{ mb: 1, display: 'block', fontWeight: 700 }}>{t('ticket.remarks')}</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.remarks || '-'}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            variant="outlined"
                            sx={{ bgcolor: '#fff' }}
                        />
                    </Box>
                    <Box sx={{ textAlign: 'right', pt: 4 }}>
                        <Typography variant="body2" color="#64748b" fontWeight={600}>
                            ผู้บันทึกรายการ: <span style={{ color: '#1e293b' }}>{formData.createdBy}</span>
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={null}
                                sx={{ borderRadius: 2, px: 3, fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                            >
                                {t('ticket.btnPrint')}
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleSubmit()}
                                sx={{ borderRadius: 2, px: 3, fontWeight: 700, bgcolor: '#64748b', '&:hover': { bgcolor: '#475569' } }}
                            >
                                {t('ticket.btnSave')}
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleSubmit('approved')}
                                sx={{ borderRadius: 2, px: 3, fontWeight: 700, bgcolor: '#1a337e', '&:hover': { bgcolor: '#10265a' } }}
                            >
                                Save & Approve
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
