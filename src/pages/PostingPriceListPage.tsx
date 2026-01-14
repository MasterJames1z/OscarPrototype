import { useState } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import {
    Box,
    Typography,
    Button,
    Paper,
    Tabs,
    Tab,
    Fab,
    Tooltip,
    Snackbar,
    Alert,
    alpha,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import {
    Add as AddIcon,
    CalendarMonth as CalendarMonthIcon,
    ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import type { PriceCard } from '../types';
import { usePriceCards } from '../hooks/usePriceCards.ts';
import { useMasters } from '../hooks/useMasters';
import PriceCardForm from '../components/PriceCardForm';
import CalendarByResourceView from '../components/CalendarByResourceView';
import CardsView from '../components/CardsView';
import { useApp } from '../context/useApp';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    contentSx?: import('@mui/material').SxProps<import('@mui/material').Theme>;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, contentSx, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            style={{ height: '100%', width: '100%' }}
            {...other}
        >
            {value === index && (
                <Box sx={{ height: '100%', ...contentSx }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function PostingPriceListPage() {
    const { cards, addCard, deleteCard } = usePriceCards();
    const { products } = useMasters();
    const { t } = useApp();
    const [activeTab, setActiveTab] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<PriceCard | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as AlertColor });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFormSubmit = (data: Omit<PriceCard, 'PriceID' | 'status' | 'createdAt'>) => {
        // Since the backend handles UPSERT with ProductID + EffectiveDate, we treat all as add/update
        addCard(data).then((success: boolean) => {
            if (success) {
                setSnackbar({ open: true, message: t('msg.saved') || 'Saved successfully', severity: 'success' });
                setIsFormOpen(false);
                setEditingCard(null);
            } else {
                setSnackbar({ open: true, message: 'Failed to save price', severity: 'error' });
            }
        });
    };

    const handleEdit = (card: PriceCard) => {
        setEditingCard(card);
        setIsFormOpen(true);
    };

    const handleCancelEdit = () => {
        setIsFormOpen(false);
        setEditingCard(null);
    };

    const handleDelete = (id: string | number) => {
        deleteCard(Number(id));
        setSnackbar({ open: true, message: t('msg.deleted'), severity: 'info' });
    };

    const handleDuplicate = (_id: number) => {
        // Not implemented in DB logic yet
        console.warn('Duplicate not implemented');
    };

    const handleQuickUpdate = (_id: number, _data: Partial<PriceCard>) => {
        console.warn('Quick update not implemented');
    };

    const openCreateForm = () => {
        setEditingCard(null);
        setIsFormOpen(true);
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
                    {t('page.title')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateForm}
                    sx={{
                        borderRadius: 3,
                        px: { xs: 2, md: 3 },
                        py: 1,
                        bgcolor: 'primary.main',
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        '&:hover': { bgcolor: '#142a66' }
                    }}
                >
                    {t('page.createBtn')}
                </Button>
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
                    <Box sx={{ px: 3, borderBottom: '1px solid', borderColor: alpha('#1a337e', 0.05), bgcolor: 'background.paper' }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                minHeight: 64,
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                }
                            }}
                        >
                            <Tab
                                icon={<CalendarMonthIcon sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={t('tab.timeline')}
                                sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', py: 2.5 }}
                            />
                            <Tab
                                icon={<ViewModuleIcon sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={t('tab.cards')}
                                sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', py: 2.5 }}
                            />
                        </Tabs>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflow: 'hidden', width: '100%', bgcolor: '#fff' }}>
                        <TabPanel value={activeTab} index={0} contentSx={{ p: 0, overflow: 'hidden', width: '100%', height: '100%' }}>
                            <CalendarByResourceView
                                cards={cards}
                                onEdit={handleEdit}
                                onDuplicate={handleDuplicate as any}
                                onDelete={handleDelete as any}
                                onUpdate={handleQuickUpdate as any}
                                allResources={products.map(p => p.ProductName)}
                            />
                        </TabPanel>
                        <TabPanel value={activeTab} index={1} contentSx={{ p: 0, width: '100%', height: '100%' }}>
                            <CardsView
                                cards={cards}
                                onEdit={handleEdit}
                                onDuplicate={handleDuplicate as any}
                                onDelete={handleDelete as any}
                            />
                        </TabPanel>
                    </Box>
                </Paper>
            </Box>

            <PriceCardForm
                key={editingCard?.PriceID || 'new'}
                open={isFormOpen}
                onClose={handleCancelEdit}
                onSubmit={handleFormSubmit}
                editingCard={editingCard}
                products={products}
            />

            <Tooltip title="Create New Price">
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 32, right: 32, display: { sm: 'none' } }}
                    onClick={openCreateForm}
                >
                    <AddIcon />
                </Fab>
            </Tooltip>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity as AlertColor}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 3, fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
