// =============================================================================
// components/ui/ReportModal.tsx — Report Filing Modal
// =============================================================================
// SRS: FR-RPT-01 to FR-RPT-09
// Allows users to anonymously report a driver/passenger after a completed ride.
// =============================================================================

import React, { useState } from 'react';
import {
    View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
    StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAlert } from './AlertContext';
import { fs, sp, wp, hp } from '../../constants/responsive';

interface ReportModalProps {
    visible: boolean;
    rideId: number;
    reportedUserId: number;
    reportedUserName: string;
    onClose: () => void;
    onSuccess: () => void;
}

const REASONS = [
    { id: 'no_show', label: 'No Show', icon: 'account-cancel', desc: 'User did not show up for the ride' },
    { id: 'unsafe_driving', label: 'Unsafe Driving', icon: 'car-traction-control', desc: 'Speeding, reckless behavior, phone use' },
    { id: 'bad_conduct', label: 'Bad Conduct', icon: 'account-alert', desc: 'Rude behavior, inappropriate language' },
    { id: 'harassment', label: 'Harassment', icon: 'shield-alert', desc: 'Unwanted advances, bullying, threats' }
] as const;

export default function ReportModal({ visible, rideId, reportedUserId, reportedUserName, onClose, onSuccess }: ReportModalProps) {
    const { showAlert } = useAlert();
    const [reason, setReason] = useState<string>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            showAlert({ type: 'error', title: 'Missing Info', message: 'Please select a reason for the report.' });
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/reports/new', {
                ride_id: rideId,
                reported_user_id: reportedUserId,
                reason,
                description: description.trim() || undefined
            });

            if (res.data.success) {
                showAlert({
                    type: 'success',
                    title: 'Report Submitted',
                    message: res.data.message
                });
                onSuccess();
            } else {
                showAlert({ type: 'error', title: 'Error', message: res.data.message });
            }
        } catch (error: any) {
            const errData = error.response?.data;
            if (errData?.error === 'REPORT_COOLDOWN') {
                showAlert({ 
                    type: 'warning', 
                    title: 'Daily Limit Reached', 
                    message: 'To prevent abuse, you can only file up to 3 reports per 24 hours. Please try again tomorrow.' 
                });
            } else if (errData?.error === 'REPORT_WINDOW_EXPIRED') {
                showAlert({ 
                    type: 'warning', 
                    title: 'Window Expired', 
                    message: 'Reports must be filed within 12 hours of the ride completing.' 
                });
            } else {
                const msg = errData?.message || 'Failed to submit report. Please try again.';
                showAlert({ type: 'error', title: 'Report Failed', message: msg });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={s.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={s.overlayBg} />
                </TouchableWithoutFeedback>
                
                <View style={s.sheet}>
                    <View style={s.header}>
                        <Text style={s.headerTitle}>Report User</Text>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <MaterialIcons name="close" size={24} color="#1E1610" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={s.content}>
                        <View style={s.infoBox}>
                            <MaterialIcons name="info-outline" size={20} color="#C24E00" />
                            <Text style={s.infoText}>
                                You are filing a report against <Text style={{ fontWeight: '700' }}>{reportedUserName}</Text>. 
                                This report is confidential. False reports will result in penalties against your own account.
                            </Text>
                        </View>

                        <Text style={s.label}>Reason for Report *</Text>
                        <View style={s.reasonGrid}>
                            {REASONS.map(r => {
                                const isSelected = reason === r.id;
                                return (
                                    <TouchableOpacity
                                        key={r.id}
                                        style={[s.reasonCard, isSelected && s.reasonCardActive]}
                                        onPress={() => setReason(r.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[s.reasonIconWrap, isSelected && s.reasonIconWrapActive]}>
                                            <MaterialCommunityIcons 
                                                name={r.icon as any} 
                                                size={24} 
                                                color={isSelected ? '#C24E00' : '#888'} 
                                            />
                                        </View>
                                        <Text style={[s.reasonLabel, isSelected && s.reasonLabelActive]}>{r.label}</Text>
                                        <Text style={s.reasonDesc}>{r.desc}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={s.label}>Additional Details (Optional)</Text>
                        <TextInput
                            style={s.input}
                            placeholder="Please provide any specific details to help our review..."
                            placeholderTextColor="#A8937F"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                        
                        <View style={{ height: hp(40) }} />
                    </ScrollView>

                    <View style={s.footer}>
                        <TouchableOpacity 
                            style={[s.submitBtn, loading && s.submitBtnDisabled]} 
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons name="shield" size={20} color="#fff" />
                                    <Text style={s.submitText}>Submit Report</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: sp(24),
        borderTopRightRadius: sp(24),
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: sp(20), borderBottomWidth: 1, borderBottomColor: '#F5F0EB'
    },
    headerTitle: { fontSize: fs(20), fontWeight: '800', color: '#1E1610' },
    closeBtn: { padding: sp(4) },
    content: { padding: sp(20) },
    infoBox: {
        flexDirection: 'row', backgroundColor: '#FEF0E4', padding: sp(16),
        borderRadius: sp(12), gap: sp(12), marginBottom: hp(24),
    },
    infoText: { flex: 1, fontSize: fs(13), color: '#C24E00', lineHeight: fs(20) },
    label: { fontSize: fs(15), fontWeight: '700', color: '#1B263B', marginBottom: hp(12) },
    reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp(12), marginBottom: hp(24) },
    reasonCard: {
        width: '48%', backgroundColor: '#F9FAFB', padding: sp(16),
        borderRadius: sp(16), borderWidth: 2, borderColor: 'transparent',
    },
    reasonCardActive: { backgroundColor: '#FFF6F5', borderColor: '#FCDCBF' },
    reasonIconWrap: {
        width: sp(40), height: sp(40), borderRadius: sp(20), backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center', marginBottom: hp(12),
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: sp(4), shadowOffset: { width: 0, height: 2 },
    },
    reasonIconWrapActive: { backgroundColor: '#FEF0E4' },
    reasonLabel: { fontSize: fs(14), fontWeight: '700', color: '#1B263B', marginBottom: hp(4) },
    reasonLabelActive: { color: '#C24E00' },
    reasonDesc: { fontSize: fs(11), color: '#666', lineHeight: fs(16) },
    input: {
        backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#EAECF0',
        borderRadius: sp(12), padding: sp(16), fontSize: fs(15), color: '#1E1610',
        minHeight: hp(100),
    },
    footer: {
        padding: sp(20), borderTopWidth: 1, borderTopColor: '#F5F0EB',
        backgroundColor: '#fff', paddingBottom: Platform.OS === 'ios' ? hp(34) : sp(20)
    },
    submitBtn: {
        backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: hp(16), borderRadius: sp(12), gap: sp(8),
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitText: { fontSize: fs(16), fontWeight: '700', color: '#fff' }
});
