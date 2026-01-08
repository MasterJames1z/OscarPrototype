import { createContext, useContext } from 'react';
import type { Language, Mode } from './types';

export interface AppContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    t: (key: string) => string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
