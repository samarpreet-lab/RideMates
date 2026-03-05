// =============================================================================
// components/ui/CustomAlert.tsx — Styled Alert Modal
// =============================================================================

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface CustomAlertProps {
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onDismiss: () => void;
    onConfirm?: () => void;
}

const ALERT_CONFIG: Record<AlertType, {
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    bgLight: string;
}> = {
    success: { icon: 'check-circle', color: '#3DAA6E', bgLight: '#F2FAF5' },
    error: { icon: 'error', color: '#D9622A', bgLight: '#FFF6F5' },
    warning: { icon: 'warning', color: '#D4960F', bgLight: '#FEFDF2' },
    info: { icon: 'info', color: '#2563eb', bgLight: '#eff6ff' },
    confirm: { icon: 'help-outline', color: '#C24E00', bgLight: '#FFF8F2' },
};

export default function CustomAlert({
    visible,
    type,
    title,
    message,
    confirmText,
    cancelText,
    onDismiss,
    onConfirm,
}: CustomAlertProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const cfg = ALERT_CONFIG[type];

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const isConfirm = type === 'confirm' && onConfirm;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={isConfirm ? undefined : onDismiss}
                />
                <Animated.View
                    style={[
                        styles.card,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    {/* Icon */}
                    <View style={[styles.iconCircle, { backgroundColor: cfg.bgLight }]}>
                        <MaterialIcons name={cfg.icon} size={32} color={cfg.color} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: cfg.color }]}>{title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Buttons */}
                    <View style={styles.btnRow}>
                        {isConfirm ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnCancel]}
                                    onPress={onDismiss}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.btnCancelText}>
                                        {cancelText || 'Cancel'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnConfirm, { backgroundColor: cfg.color }]}
                                    onPress={onConfirm}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.btnConfirmText}>
                                        {confirmText || 'Confirm'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.btn, styles.btnDismiss, { backgroundColor: cfg.color }]}
                                onPress={onDismiss}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.btnDismissText}>
                                    {confirmText || 'OK'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: width - 64,
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#6B5344',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    btn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnCancel: {
        backgroundColor: '#F5F0EB',
        borderWidth: 1,
        borderColor: '#EAE0D8',
    },
    btnCancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#6B5344',
    },
    btnConfirm: {
        elevation: 2,
    },
    btnConfirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    btnDismiss: {
        elevation: 2,
    },
    btnDismissText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});
