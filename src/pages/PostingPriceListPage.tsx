import { useState } from 'react';
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
    const { cards, addCard, updateCard, deleteCard, duplicateCard, allResources } = usePriceCards();
    const { t } = useApp();
    const [activeTab, setActiveTab] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<PriceCard | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as AlertColor });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFormSubmit = (data: Omit<PriceCard, 'id' | 'createdAt' | 'status'>) => {
        if (editingCard) {
            updateCard(editingCard.id, data);
            setSnackbar({ open: true, message: t('msg.updated'), severity: 'success' });
        } else {
            addCard(data);
            setSnackbar({ open: true, message: t('msg.created'), severity: 'success' });
        }
        setIsFormOpen(false);
        setEditingCard(null);
    };

    const handleEdit = (card: PriceCard) => {
        setEditingCard(card);
        setIsFormOpen(true);
    };

    const handleCancelEdit = () => {
        setIsFormOpen(false);
        setEditingCard(null);
    };

    const handleDelete = (id: string) => {
        deleteCard(id);
        setSnackbar({ open: true, message: t('msg.deleted'), severity: 'info' });
    };

    const handleDuplicate = (id: string) => {
        duplicateCard(id);
        setSnackbar({ open: true, message: t('msg.duplicated'), severity: 'success' });
    };

    const openCreateForm = () => {
        setEditingCard(null);
        setIsFormOpen(true);
    };

    return (
        <Box sx={{ height: 'calc(100vh - 80px)', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', pt: 4, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 4, width: '100%' }}>
                <Typography variant="h4" sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    letterSpacing: -0.5,
                    fontSize: '1.75rem'
                }}>
                    {t('page.title')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateForm}
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: '#142a66' }
                    }}
                >
                    {t('page.createBtn')}
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden', width: '100%', px: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: 5,
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
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                                allResources={allResources}
                            />
                        </TabPanel>
                        <TabPanel value={activeTab} index={1} contentSx={{ p: 4, width: '100%', height: '100%' }}>
                            <CardsView
                                cards={cards}
                                onEdit={handleEdit}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                            />
                        </TabPanel>
                    </Box>
                </Paper>
            </Box>

            <PriceCardForm
                key={editingCard?.id || 'new'}
                open={isFormOpen}
                onClose={handleCancelEdit}
                onSubmit={handleFormSubmit}
                editingCard={editingCard}
                allResources={allResources}
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
