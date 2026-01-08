import { useState } from 'react';
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
import { createFilterOptions } from '@mui/material/Autocomplete';
import { useApp } from '../context/useApp';
import type { PriceCard } from '../types';

interface OptionType {
    inputValue?: string;
    resourceName: string;
}

interface PriceCardFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<PriceCard, 'id' | 'createdAt' | 'status'>) => void;
    editingCard?: PriceCard | null;
    allResources: string[];
}

const filter = createFilterOptions<OptionType>();

export default function PriceCardForm({ open, onClose, onSubmit, editingCard, allResources }: PriceCardFormProps) {
    const { t } = useApp();
    const [formData, setFormData] = useState({
        resourceName: editingCard?.resourceName || '',
        unitPrice: editingCard?.unitPrice.toString() || '',
        startDate: editingCard?.startDate || '',
        endDate: editingCard?.endDate || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            resourceName: formData.resourceName,
            unitPrice: Number(formData.unitPrice),
            startDate: formData.startDate,
            endDate: formData.endDate,
        });
    };

    const resourceOptions: OptionType[] = allResources.map(r => ({ resourceName: r }));

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                            value={formData.resourceName ? { resourceName: formData.resourceName } : null}
                            onChange={(_event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setFormData({ ...formData, resourceName: newValue });
                                } else if (newValue && newValue.inputValue) {
                                    setFormData({ ...formData, resourceName: newValue.inputValue });
                                } else {
                                    setFormData({ ...formData, resourceName: newValue?.resourceName || '' });
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);
                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.resourceName);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue,
                                        resourceName: `Add "${inputValue}"`,
                                    });
                                }
                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            options={resourceOptions}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') return option;
                                if (option.inputValue) return option.inputValue;
                                return option.resourceName;
                            }}
                            renderOption={(props, option) => (
                                <li {...props} key={option.resourceName}>
                                    {option.resourceName}
                                </li>
                            )}
                            freeSolo
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
                            value={formData.unitPrice}
                            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label={t('form.start')}
                                type="date"
                                fullWidth
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label={t('form.end')}
                                type="date"
                                fullWidth
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
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
