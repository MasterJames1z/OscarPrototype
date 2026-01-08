import React, { useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { translations } from './types';
import type { Language, Mode } from './types';
import { AppContext } from './useApp';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [mode, setMode] = useState<Mode>('light');

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            primary: {
                main: '#1a337e',
                light: mode === 'light' ? '#eef2ff' : '#2d3748',
            },
            secondary: {
                main: '#3b82f6',
            },
            background: {
                default: mode === 'light' ? '#f8fafc' : '#0f172a',
                paper: mode === 'light' ? '#ffffff' : '#1e293b',
            },
            text: {
                primary: mode === 'light' ? '#1e293b' : '#f8fafc',
                secondary: mode === 'light' ? '#64748b' : '#94a3b8',
            }
        },
        typography: {
            fontFamily: '"Outfit", "Inter", "Prompt", sans-serif',
            h4: {
                fontWeight: 700,
                color: mode === 'light' ? '#1a337e' : '#f8fafc',
            },
            h5: {
                fontWeight: 600,
            },
            subtitle1: {
                fontWeight: 600,
            }
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        backgroundImage: 'none',
                    }
                }
            }
        }
    }), [mode]);

    const t = (key: string) => translations[language][key] || key;

    return (
        <AppContext.Provider value={{ language, setLanguage, mode, setMode, t }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </AppContext.Provider>
    );
};
