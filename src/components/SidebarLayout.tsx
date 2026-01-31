import { useState } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Avatar,
    Button,
    IconButton,
    Stack,
    Divider,
    alpha,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    AttachMoney as AttachMoneyIcon,
    Receipt as ReceiptIcon,
    Menu as MenuIcon,
    Language as LanguageIcon,
    Bookmark as BookmarkIcon,
    Settings as SettingsIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

export default function SidebarLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const { language, setLanguage, mode, setMode, t } = useApp();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const menuItems = [
        { text: t('side.priceList'), icon: <AttachMoneyIcon />, path: '/' },
        { text: t('side.ticket'), icon: <ReceiptIcon />, path: '/create-ticket' },
    ];

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'th' : 'en');
    };

    const toggleTheme = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarVisible(!sidebarVisible);
        }
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Section */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 22,
                    boxShadow: '0 4px 12px rgba(26, 51, 126, 0.2)'
                }}>Z</Box>
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1, fontSize: '1.4rem' }}>
                    ZYCODA
                </Typography>
            </Box>

            {/* Profile Section */}
            <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar sx={{
                        width: 68,
                        height: 68,
                        bgcolor: mode === 'light' ? 'grey.100' : 'grey.800',
                        color: 'primary.main',
                        fontSize: 32,
                        fontWeight: 'bold',
                        mx: 'auto',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}>
                        {user?.firstname ? user.firstname.charAt(0) : 'U'}
                    </Avatar>
                    <Box sx={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        bgcolor: '#4ade80',
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: 'background.paper'
                    }} />
                </Box>
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 700 }}>
                    {user ? `${user.firstname} ${user.lastname}` : 'Guest'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2.5 }}>
                    {user ? `Plant: ${user.plant}` : 'Please Login'}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Button size="small" variant="outlined" sx={{ borderRadius: 4, px: 2, py: 0.5, fontSize: '0.7rem' }}>EditProfile</Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={logout}
                        sx={{ borderRadius: 4, px: 2, py: 0.5, fontSize: '0.7rem', borderColor: 'error.main', color: 'error.main', '&:hover': { borderColor: 'error.dark', bgcolor: 'error.lighter' } }}
                    >
                        Logout
                    </Button>
                </Stack>
            </Box>

            <Divider sx={{ mx: 2, mb: 3 }} />

            <Box sx={{ overflow: 'auto', px: 1.5 }}>
                <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: 3,
                                    py: 1.5,
                                    '&.Mui-selected': {
                                        bgcolor: alpha(mode === 'light' ? '#1a337e' : '#3b82f6', 0.1),
                                        color: mode === 'light' ? 'primary.main' : '#3b82f6',
                                        '& .MuiListItemIcon-root': { color: mode === 'light' ? 'primary.main' : '#3b82f6' }
                                    },
                                    '&:hover': {
                                        bgcolor: alpha(mode === 'light' ? '#1a337e' : '#3b82f6', 0.05),
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 700 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box sx={{ mt: 'auto', p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 14 }}>
                        Z
                    </Avatar>
                    <Typography variant="caption" fontWeight={700}>{t('side.chat')}</Typography>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
            <CssBaseline />

            {/* Background Decorative Element */}
            {mode === 'light' && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '60%',
                        height: '60%',
                        background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.4) 0%, rgba(219, 234, 254, 0) 100%)',
                        clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}

            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton size="small" onClick={handleDrawerToggle}>
                            <MenuIcon />
                        </IconButton>
                        <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                            <Typography
                                variant="body2"
                                onClick={() => navigate('/')}
                                sx={{
                                    fontWeight: 700,
                                    color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                                    cursor: 'pointer',
                                }}
                            >
                                {t('nav.home')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', cursor: 'pointer' }}>
                                {t('nav.report')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', cursor: 'pointer' }}>
                                {t('nav.help')}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Button
                            startIcon={<LanguageIcon />}
                            size="small"
                            onClick={toggleLanguage}
                            sx={{ color: 'text.secondary', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
                        >
                            {language === 'en' ? 'English' : 'ไทย'}
                        </Button>
                        <IconButton size="small" onClick={toggleLanguage} sx={{ display: { xs: 'flex', sm: 'none' } }}>
                            <LanguageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </IconButton>
                        <IconButton size="small">
                            <BookmarkIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </IconButton>
                        <Box
                            onClick={toggleTheme}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: mode === 'light' ? 'grey.100' : 'grey.800',
                                borderRadius: 10,
                                px: 1.5,
                                py: 0.5,
                                gap: 1,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: mode === 'light' ? 'grey.200' : 'grey.700' }
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>
                                {mode === 'light' ? t('nav.light') : t('nav.dark')}
                            </Typography>
                            {mode === 'light' ? <LightModeIcon sx={{ fontSize: 16 }} /> : <DarkModeIcon sx={{ fontSize: 16 }} />}
                        </Box>
                        <IconButton size="small">
                            <SettingsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </IconButton>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{
                    width: isMobile ? 0 : (sidebarVisible ? drawerWidth : 0),
                    flexShrink: 0,
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="persistent"
                    open={sidebarVisible}
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            backgroundImage: 'none',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 0,
                    position: 'relative',
                    zIndex: 1,
                    bgcolor: 'background.default',
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    width: '100%',
                    overflow: 'hidden'
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
