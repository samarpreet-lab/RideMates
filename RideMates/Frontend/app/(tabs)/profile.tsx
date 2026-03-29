// =============================================================================
// app/(tabs)/profile.tsx — User Profile Screen
// =============================================================================
// SRS: FR-AUTH-06, FR-AUTH-07, Section 9.1-9.3
//
// Displays user info, trust score, streak, and allows editing name/phone.
// Accessible via avatar tap on Explore screen.
// =============================================================================

import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api, { deleteToken } from '../../services/api';
import { s } from '../../components/Profile/styles';
import { useAlert } from '../../components/ui/AlertContext';

interface Profile {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
    gender: string;
    trust_score: number;
    current_streak: number;
    created_at: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/profile');
            if (res.data.success) {
                setProfile(res.data.data);
                setEditName(res.data.data.full_name);
                setEditPhone(res.data.data.phone || '');
            }
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: 'Could not load profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editName.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'Name cannot be empty.' });
            return;
        }
        setSaving(true);
        try {
            const res = await api.put('/auth/profile', {
                full_name: editName.trim(),
                phone: editPhone.trim() || null,
            });
            if (res.data.success) {
                showAlert({ type: 'success', title: 'Saved', message: 'Profile updated successfully.' });
                setEditing(false);
                fetchProfile();
            } else {
                showAlert({ type: 'error', title: 'Error', message: res.data.message });
            }
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Could not update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out', style: 'destructive',
                onPress: async () => {
                    await deleteToken();
                    router.replace('/' as any);
                },
            },
        ]);
    };

    // Trust color based on score
    const getTrustColor = (score: number) => {
        if (score >= 80) return '#3DAA6E';
        if (score >= 50) return '#D4960F';
        return '#D9622A';
    };

    if (loading) {
        return (
            <View style={s.root}>
                <View style={s.header}>
                    <TouchableOpacity style={s.backBtn} onPress={() => router.push('/(tabs)/explore')}>
                        <MaterialIcons name="arrow-back" size={22} color="#1E1610" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Profile</Text>
                </View>
                <View style={s.centerContainer}>
                    <ActivityIndicator size="large" color="#C24E00" />
                </View>
            </View>
        );
    }

    if (!profile) return null;

    const initials = profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    const trustColor = getTrustColor(profile.trust_score);
    const roleBadgeColor = profile.role === 'faculty' ? '#7b1fa2' : '#1976d2';
    const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long',
    });

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.push('/(tabs)/explore')}>
                    <MaterialIcons name="arrow-back" size={22} color="#1E1610" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Avatar + Name */}
                <View style={s.avatarSection}>
                    <View style={s.avatarCircle}>
                        <Text style={s.avatarInitials}>{initials}</Text>
                    </View>
                    <Text style={s.profileName}>{profile.full_name}</Text>
                    <Text style={s.profileEmail}>{profile.email}</Text>
                    <View style={[s.roleBadge, { backgroundColor: roleBadgeColor + '22' }]}>
                        <MaterialIcons
                            name={profile.role === 'faculty' ? 'school' : 'badge'}
                            size={14}
                            color={roleBadgeColor}
                        />
                        <Text style={[s.roleBadgeText, { color: roleBadgeColor }]}>
                            {profile.role}
                        </Text>
                    </View>
                </View>

                {/* Trust Score + Streak */}
                <View style={s.statsRow}>
                    <View style={s.statCard}>
                        <View style={[s.statIconWrap, { backgroundColor: trustColor + '22' }]}>
                            <MaterialIcons name="verified-user" size={22} color={trustColor} />
                        </View>
                        <Text style={[s.statValue, { color: trustColor }]}>{profile.trust_score}</Text>
                        <Text style={s.statLabel}>Trust Score</Text>
                    </View>
                    <View style={s.statCard}>
                        <View style={[s.statIconWrap, { backgroundColor: '#FEF0E4' }]}>
                            <MaterialIcons name="local-fire-department" size={22} color="#C24E00" />
                        </View>
                        <Text style={s.statValue}>{profile.current_streak}</Text>
                        <Text style={s.statLabel}>Clean Streak</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={s.infoSection}>
                    <Text style={s.infoSectionTitle}>Account Details</Text>

                    {/* Full Name */}
                    <View style={s.infoRow}>
                        <View style={s.infoIconWrap}>
                            <MaterialIcons name="person" size={18} color="#C24E00" />
                        </View>
                        <View style={s.infoTextWrap}>
                            <Text style={s.infoLabel}>Full Name</Text>
                            {editing ? (
                                <TextInput
                                    style={s.editInput}
                                    value={editName}
                                    onChangeText={setEditName}
                                    autoFocus
                                />
                            ) : (
                                <Text style={s.infoValue}>{profile.full_name}</Text>
                            )}
                        </View>
                    </View>

                    {/* Email */}
                    <View style={s.infoRow}>
                        <View style={s.infoIconWrap}>
                            <MaterialIcons name="email" size={18} color="#C24E00" />
                        </View>
                        <View style={s.infoTextWrap}>
                            <Text style={s.infoLabel}>Email (cannot be changed)</Text>
                            <Text style={s.infoValue}>{profile.email}</Text>
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={s.infoRow}>
                        <View style={s.infoIconWrap}>
                            <MaterialIcons name="phone" size={18} color="#C24E00" />
                        </View>
                        <View style={s.infoTextWrap}>
                            <Text style={s.infoLabel}>Phone</Text>
                            {editing ? (
                                <TextInput
                                    style={s.editInput}
                                    value={editPhone}
                                    onChangeText={setEditPhone}
                                    keyboardType="phone-pad"
                                    placeholder="Enter phone number"
                                />
                            ) : (
                                <Text style={s.infoValue}>{profile.phone || 'Not set'}</Text>
                            )}
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={s.infoRow}>
                        <View style={s.infoIconWrap}>
                            <MaterialIcons name="wc" size={18} color="#C24E00" />
                        </View>
                        <View style={s.infoTextWrap}>
                            <Text style={s.infoLabel}>Gender</Text>
                            <Text style={s.infoValue}>{profile.gender || 'Not set'}</Text>
                        </View>
                    </View>

                    {/* Member Since */}
                    <View style={s.infoRow}>
                        <View style={s.infoIconWrap}>
                            <MaterialIcons name="calendar-today" size={18} color="#C24E00" />
                        </View>
                        <View style={s.infoTextWrap}>
                            <Text style={s.infoLabel}>Member Since</Text>
                            <Text style={s.infoValue}>{memberSince}</Text>
                        </View>
                    </View>
                </View>

                {/* Edit / Save Button */}
                {editing ? (
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                        <TouchableOpacity
                            style={[s.logoutBtn, { flex: 1, backgroundColor: '#C24E00', borderColor: '#C24E00' }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons name="check" size={20} color="#fff" />
                                    <Text style={[s.logoutBtnText, { color: '#fff' }]}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.logoutBtn, { flex: 1 }]}
                            onPress={() => {
                                setEditing(false);
                                setEditName(profile.full_name);
                                setEditPhone(profile.phone || '');
                            }}
                        >
                            <MaterialIcons name="close" size={20} color="#D9622A" />
                            <Text style={s.logoutBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[s.logoutBtn, { backgroundColor: '#FEF0E4', borderColor: '#FCDCBF', marginBottom: 16 }]}
                        onPress={() => setEditing(true)}
                    >
                        <MaterialIcons name="edit" size={20} color="#C24E00" />
                        <Text style={[s.logoutBtnText, { color: '#C24E00' }]}>Edit Profile</Text>
                    </TouchableOpacity>
                )}

                {/* Logout */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#D9622A" />
                    <Text style={s.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
