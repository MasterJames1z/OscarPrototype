import { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Autocomplete,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { useApp } from '../context/useApp';
import { usePriceHistory } from '../hooks/usePriceHistory';
import type { PriceCard, Product } from '../types';
import dayjs from 'dayjs';

interface PriceCardFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<PriceCard, 'PriceID' | 'status' | 'createdAt'>) => void;
    editingCard?: PriceCard | null;
    products: Product[];
}

const INITIAL_FORM_STATE = {
    ProductID: 0,
    UnitPrice: '',
    EffectiveDate: '',
    ToDate: '',
};

export default function PriceCardForm({ open, onClose, onSubmit, editingCard, products }: PriceCardFormProps) {
    const { t } = useApp();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const { history } = usePriceHistory(editingCard?.PriceID);

    useEffect(() => {
        if (editingCard) {
            setFormData({
                ProductID: editingCard.ProductID,
                UnitPrice: editingCard.UnitPrice.toString(),
                EffectiveDate: editingCard.EffectiveDate.split('T')[0],
                ToDate: editingCard.ToDate ? editingCard.ToDate.split('T')[0] : '',
            });
        } else {
            setFormData(INITIAL_FORM_STATE);
        }
    }, [editingCard, open]);

    const handleClose = () => {
        setFormData(INITIAL_FORM_STATE);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ProductID: formData.ProductID,
            UnitPrice: Number(formData.UnitPrice),
            EffectiveDate: formData.EffectiveDate,
            ToDate: formData.ToDate || undefined,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    p: 2,
                    bgcolor: 'background.paper',
                    backgroundImage: 'none'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {editingCard ? t('form.editTitle') : t('form.createTitle')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 600 }}>
                    {editingCard ? `Price ID: #${editingCard.PriceID}` : t('form.subtitle')}
                </Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Autocomplete
                            options={products}
                            getOptionLabel={(option) => option.ProductName}
                            value={products.find(p => p.ProductID === formData.ProductID) || null}
                            onChange={(_event, newValue) => {
                                setFormData({ ...formData, ProductID: newValue?.ProductID || 0 });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('form.resource')}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                        />
                        <TextField
                            label={t('form.price')}
                            type="number"
                            fullWidth
                            value={formData.UnitPrice}
                            onChange={(e) => setFormData({ ...formData, UnitPrice: e.target.value })}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label={t('form.start')}
                                type="date"
                                fullWidth
                                value={formData.EffectiveDate}
                                onChange={(e) => setFormData({ ...formData, EffectiveDate: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label={t('form.end')}
                                type="date"
                                fullWidth
                                value={formData.ToDate}
                                onChange={(e) => setFormData({ ...formData, ToDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                helperText="Leave empty for single day price"
                            />
                        </Stack>
                    </Stack>

                    {editingCard && history.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Divider sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                    HISTORY LOGS
                                </Typography>
                            </Divider>
                            <List dense sx={{ bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, maxH: 200, overflow: 'auto' }}>
                                {history.map((h) => (
                                    <ListItem key={h.HistoryID} sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="caption" fontWeight={700} color="primary">
                                                        {h.ActionType} by {h.ChangedBy}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {dayjs(h.ChangedAt).format('DD/MM/YYYY HH:mm:ss')}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5 }}>
                                                    {h.ActionType === 'UPDATE' ? (
                                                        <Typography variant="caption" display="block">
                                                            <strong>Price:</strong> {
                                                                (h.NewUnitPrice === null || h.NewUnitPrice === undefined)
                                                                    ? h.OldUnitPrice
                                                                    : (h.OldUnitPrice === h.NewUnitPrice ? h.NewUnitPrice : `${h.OldUnitPrice} → ${h.NewUnitPrice}`)
                                                            } <br />
                                                            <strong>Date:</strong> {
                                                                ((h.NewEffectiveDate === null || h.NewEffectiveDate === undefined) && (h.NewToDate === null || h.NewToDate === undefined))
                                                                    ? `(${dayjs(h.OldEffectiveDate).format('DD/MM')} - ${h.OldToDate ? dayjs(h.OldToDate).format('DD/MM') : dayjs(h.OldEffectiveDate).format('DD/MM')})`
                                                                    : (h.OldEffectiveDate === h.NewEffectiveDate && h.OldToDate === h.NewToDate)
                                                                        ? `(${dayjs(h.NewEffectiveDate).format('DD/MM')} - ${h.NewToDate ? dayjs(h.NewToDate).format('DD/MM') : dayjs(h.NewEffectiveDate).format('DD/MM')})`
                                                                        : `(${dayjs(h.OldEffectiveDate).format('DD/MM')} - ${h.OldToDate ? dayjs(h.OldToDate).format('DD/MM') : dayjs(h.OldEffectiveDate).format('DD/MM')}) → 
                                                                   (${dayjs(h.NewEffectiveDate).format('DD/MM')} - ${h.NewToDate ? dayjs(h.NewToDate).format('DD/MM') : dayjs(h.NewEffectiveDate).format('DD/MM')})`
                                                            }
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="caption" display="block">
                                                            <strong>Initial Price:</strong> {h.NewUnitPrice} <br />
                                                            <strong>Initial Date:</strong> {dayjs(h.NewEffectiveDate).format('DD/MM/YYYY')}
                                                            {h.NewToDate && ` - ${dayjs(h.NewToDate).format('DD/MM/YYYY')}`}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
                        {t('form.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            px: 4,
                            borderRadius: 3,
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: '#142a66' }
                        }}
                    >
                        {editingCard ? t('form.submitUpdate') : t('form.submitCreate')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
