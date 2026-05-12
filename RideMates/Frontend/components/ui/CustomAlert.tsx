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
    bgColor: string;
    bubbleColor: string;
    textColor: string;
}> = {
    success: { icon: 'check', bgColor: '#3DAA6E', bubbleColor: '#287F4F', textColor: '#FFFFFF' },
    error: { icon: 'close', bgColor: '#D9622A', bubbleColor: '#A84112', textColor: '#FFFFFF' },
    warning: { icon: 'priority-high', bgColor: '#D4960F', bubbleColor: '#9C6F0A', textColor: '#FFFFFF' },
    info: { icon: 'question-mark', bgColor: '#007AFF', bubbleColor: '#005AC6', textColor: '#FFFFFF' },
    confirm: { icon: 'help', bgColor: '#C24E00', bubbleColor: '#8C3800', textColor: '#FFFFFF' },
};

// SVG shapes could be used here for more complex splats, but View border-radii work well for a native approach
const Splats = ({ color }: { color: string }) => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.splat1, { backgroundColor: color }]} />
        <View style={[styles.splat2, { backgroundColor: color }]} />
        <View style={[styles.splat3, { backgroundColor: color }]} />
    </View>
);

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
    }, [visible, scaleAnim, fadeAnim]);

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

                {/* The Animated Wrapper keeps overflow visible so the bubble pops out */}
                <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>

                    {/* The Main Card with overflow hidden */}
                    <View style={[styles.card, { backgroundColor: cfg.bgColor }]}>
                        <Splats color={cfg.bubbleColor} />

                        <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
                            <MaterialIcons name="close" size={20} color={cfg.textColor} />
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: cfg.textColor }]}>{title}</Text>
                        <Text style={[styles.message, { color: cfg.textColor }]}>{message}</Text>

                        {/* Confirmation Buttons (Only for 'confirm' type) */}
                        {isConfirm && (
                            <View style={styles.btnRow}>
                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: cfg.bubbleColor }]}
                                    onPress={onDismiss}
                                >
                                    <Text style={[styles.btnText, { color: cfg.textColor }]}>
                                        {cancelText || 'Cancel'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnConfirm]}
                                    onPress={onConfirm}
                                >
                                    <Text style={styles.btnConfirmText}>
                                        {confirmText || 'Confirm'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* The Pop-out Icon Bubble */}
                    <View style={[styles.bubbleWrap, { backgroundColor: cfg.bubbleColor }]}>
                        <MaterialIcons name={cfg.icon} size={28} color={cfg.textColor} />
                    </View>
                    {/* Bubble Tail */}
                    <View style={[styles.bubbleTail, { borderTopColor: cfg.bubbleColor }]} />

                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    wrapper: {
        width: width - 40,
        maxWidth: 400,
        // Overflow visible allows the bubble to be drawn outside
    },
    card: {
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 36, // leave room for bubble
        paddingBottom: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        minHeight: 120,
        justifyContent: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.9,
        marginLeft: 4,
    },
    bubbleWrap: {
        position: 'absolute',
        top: -24,
        left: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    bubbleTail: {
        position: 'absolute',
        top: 24,
        left: 24,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderTopWidth: 16,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        // borderTopColor applied dynamically
        transform: [{ rotate: '-45deg' }],
        zIndex: -1,
    },
    // Background Splats
    splat1: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        bottom: -50,
        left: -40,
        opacity: 0.8,
    },
    splat2: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        bottom: 20,
        left: 60,
        opacity: 0.6,
    },
    splat3: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        bottom: 50,
        left: 110,
        opacity: 0.7,
    },
    // Buttons
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    btn: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnConfirm: {
        backgroundColor: '#FFFFFF',
    },
    btnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    btnConfirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333333',
    },
});
