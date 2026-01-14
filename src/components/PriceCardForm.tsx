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
} from '@mui/material';
import { useApp } from '../context/useApp';
import type { PriceCard, Product } from '../types';

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
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {t('form.subtitle')}
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
