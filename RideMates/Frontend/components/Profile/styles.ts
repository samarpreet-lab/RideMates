// =============================================================================
// components/Profile/styles.ts — Styles for Profile Screen
// =============================================================================

import { StyleSheet, Platform, StatusBar } from 'react-native';
import { sp, fs, wp, hp } from '@/constants/responsive';

export const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F0EB' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + hp(12) : hp(50),
        paddingHorizontal: wp(16),
        paddingBottom: hp(16),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EAE0D8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: sp(4),
        shadowOffset: { width: 0, height: 1 },
    },
    backBtn: {
        width: sp(36), height: sp(36), borderRadius: sp(18),
        backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center',
        marginRight: wp(12),
    },
    headerTitle: { fontSize: fs(24), fontWeight: '800', color: '#1E1610' },

    scrollContent: { padding: sp(16), paddingBottom: hp(120) },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        paddingVertical: hp(24),
        backgroundColor: '#fff',
        borderRadius: sp(16),
        borderWidth: 1,
        borderColor: '#EAE0D8',
        marginBottom: hp(16),
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: sp(6),
        shadowOffset: { width: 0, height: 2 },
    },
    avatarCircle: {
        width: sp(80), height: sp(80), borderRadius: sp(40),
        backgroundColor: '#C24E00', alignItems: 'center', justifyContent: 'center',
        marginBottom: hp(12),
        elevation: 4,
        shadowColor: '#C24E00',
        shadowOpacity: 0.3,
        shadowRadius: sp(8),
        shadowOffset: { width: 0, height: 4 },
    },
    avatarInitials: { fontSize: fs(28), fontWeight: '800', color: '#fff' },
    profileName: { fontSize: fs(20), fontWeight: '800', color: '#1E1610', marginBottom: hp(4) },
    profileEmail: { fontSize: fs(13), color: '#6B5344' },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: sp(4),
        paddingHorizontal: wp(12), paddingVertical: hp(5), borderRadius: sp(12),
        marginTop: hp(8),
    },
    roleBadgeText: { fontSize: fs(11), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Stats Row (Trust + Streak)
    statsRow: {
        flexDirection: 'row', gap: sp(12),
        marginBottom: hp(16),
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: sp(16),
        padding: sp(16),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAE0D8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: sp(6),
        shadowOffset: { width: 0, height: 2 },
    },
    statIconWrap: {
        width: sp(44), height: sp(44), borderRadius: sp(22),
        alignItems: 'center', justifyContent: 'center',
        marginBottom: hp(8),
    },
    statValue: { fontSize: fs(22), fontWeight: '800', color: '#1E1610' },
    statLabel: { fontSize: fs(11), fontWeight: '600', color: '#6B5344', marginTop: hp(2) },

    // Info Section
    infoSection: {
        backgroundColor: '#fff',
        borderRadius: sp(16),
        borderWidth: 1,
        borderColor: '#EAE0D8',
        marginBottom: hp(16),
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: sp(6),
        shadowOffset: { width: 0, height: 2 },
    },
    infoSectionTitle: {
        fontSize: fs(13), fontWeight: '800', color: '#6B5344',
        letterSpacing: 0.5, textTransform: 'uppercase',
        paddingHorizontal: wp(16), paddingTop: hp(14), paddingBottom: hp(8),
    },
    infoRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: wp(16), paddingVertical: hp(14),
        borderTopWidth: 1, borderTopColor: '#F5F0EB',
        gap: sp(12),
    },
    infoIconWrap: {
        width: sp(36), height: sp(36), borderRadius: sp(18),
        backgroundColor: '#FEF0E4', alignItems: 'center', justifyContent: 'center',
    },
    infoTextWrap: { flex: 1 },
    infoLabel: { fontSize: fs(11), fontWeight: '600', color: '#A8937F' },
    infoValue: { fontSize: fs(14), fontWeight: '700', color: '#1E1610', marginTop: hp(2) },

    // Edit Input
    editInput: {
        fontSize: fs(14), fontWeight: '600', color: '#1E1610',
        borderBottomWidth: 1.5, borderBottomColor: '#C24E00',
        paddingVertical: hp(4), paddingHorizontal: 0, marginTop: hp(2),
    },

    // Edit Button
    editBtn: {
        paddingHorizontal: wp(12), paddingVertical: hp(6),
        borderRadius: sp(8), backgroundColor: '#FEF0E4',
    },
    editBtnText: { fontSize: fs(12), fontWeight: '700', color: '#C24E00' },

    // Logout
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: sp(8),
        backgroundColor: '#FFF6F5',
        borderRadius: sp(16),
        paddingVertical: hp(16),
        borderWidth: 1, borderColor: '#FCDCBF',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: sp(6),
        shadowOffset: { width: 0, height: 2 },
    },
    logoutBtnText: { fontSize: fs(15), fontWeight: '700', color: '#D9622A' },

    // Loading
    centerContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
});
