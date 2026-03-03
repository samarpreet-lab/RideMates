// =============================================================================
// components/ui/AlertContext.tsx — Global Alert Context + Provider
// =============================================================================

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import CustomAlert, { AlertType } from './CustomAlert';

export interface AlertConfig {
    type: AlertType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onDismiss?: () => void;
}

interface AlertContextType {
    showAlert: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextType>({
    showAlert: () => { },
});

export const useAlert = () => useContext(AlertContext);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertConfig | null>(null);
    const callbackRef = useRef<{ onConfirm?: () => void; onDismiss?: () => void }>({});

    const showAlert = useCallback((cfg: AlertConfig) => {
        callbackRef.current = { onConfirm: cfg.onConfirm, onDismiss: cfg.onDismiss };
        setConfig(cfg);
        setVisible(true);
    }, []);

    const handleDismiss = useCallback(() => {
        setVisible(false);
        callbackRef.current.onDismiss?.();
        setTimeout(() => setConfig(null), 300);
    }, []);

    const handleConfirm = useCallback(() => {
        setVisible(false);
        callbackRef.current.onConfirm?.();
        setTimeout(() => setConfig(null), 300);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {config && (
                <CustomAlert
                    visible={visible}
                    type={config.type}
                    title={config.title}
                    message={config.message}
                    confirmText={config.confirmText}
                    cancelText={config.cancelText}
                    onDismiss={handleDismiss}
                    onConfirm={config.type === 'confirm' ? handleConfirm : undefined}
                />
            )}
        </AlertContext.Provider>
    );
}
