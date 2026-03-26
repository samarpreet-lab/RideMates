// =============================================================================
// components/MyRides/styles.ts — Styles for My Rides Tab and Components
// =============================================================================

import { StyleSheet, Platform, StatusBar } from 'react-native';
import { sp, fs, wp, hp } from '@/constants/responsive';

export const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F0EB' },

    // Header 
    header: {
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
    headerTitle: { fontSize: fs(24), fontWeight: '800', color: '#1E1610' },

    // Custom Top Tabs
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: wp(16),
        paddingTop: hp(8),
        borderBottomWidth: 1,
        borderBottomColor: '#EAE0D8',
        position: 'relative',
        zIndex: 1,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: hp(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sp(6),
    },
    tabText: {
        fontSize: fs(14),
        fontWeight: '700',
        color: '#6B5344',
    },
    tabTextActive: {
        color: '#C24E00',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -1,
        height: sp(3),
        backgroundColor: '#C24E00',
        borderTopLeftRadius: sp(3),
        borderTopRightRadius: sp(3),
        zIndex: 2,
    },

    // Main List Layout
    listContent: {
        padding: sp(16),
        paddingBottom: hp(100), // Extra padding to account for tab bar
    },
    listGap: {
        height: hp(12),
    },

    // Loading & Empty States
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(32),
    },
    emptyTitle: {
        fontSize: fs(18),
        fontWeight: '700',
        color: '#3D2F22',
        marginTop: hp(16),
    },
    emptySub: {
        fontSize: fs(14),
        color: '#6B5344',
        textAlign: 'center',
        marginTop: hp(8),
        lineHeight: fs(20),
    },

    // --- My Ride Card Extensions (Shared from RideCard, tweaked for history) ---
    card: {
        backgroundColor: '#fff',
        borderRadius: sp(16),
        padding: sp(16),
        borderWidth: 1,
        borderColor: '#EAE0D8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: sp(6),
        shadowOffset: { width: 0, height: 2 },
    },
    statusBadgeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(12),
    },
    statusBadge: {
        paddingHorizontal: wp(10),
        paddingVertical: hp(4),
        borderRadius: sp(12),
    },
    statusText: {
        fontSize: fs(11),
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Role specific rows
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: hp(14),
        paddingTop: hp(12),
        borderTopWidth: 1,
        borderTopColor: '#F5F0EB',
    },
    metaLabel: { fontSize: fs(11), color: '#6B5344', fontWeight: '600' },
    metaValue: { fontSize: fs(13), color: '#1E1610', fontWeight: '800' },

    // Cancel Booking button (passenger cards)
    cancelBookingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(6),
        marginTop: hp(14),
        paddingVertical: hp(10),
        borderRadius: sp(12),
        backgroundColor: '#FFF6F5',
        borderWidth: 1,
        borderColor: '#FCDCBF',
    },
    cancelBookingBtnText: {
        fontSize: fs(13),
        fontWeight: '700',
        color: '#D9622A',
    },

    // WhatsApp + Cancel side-by-side action row (passenger confirmed bookings)
    actionBtnRow: {
        flexDirection: 'row',
        gap: sp(8),
        marginTop: hp(14),
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(6),
        paddingVertical: hp(10),
        borderRadius: sp(12),
        borderWidth: 1,
    },
    whatsappActionBtn: {
        backgroundColor: '#FEF0E4',
        borderColor: '#FCDCBF',
    },
    whatsappActionBtnText: {
        fontSize: fs(13),
        fontWeight: '700',
        color: '#C24E00',
    },
    cancelActionBtn: {
        backgroundColor: '#FFF6F5',
        borderColor: '#FCDCBF',
    },
    cancelActionBtnText: {
        fontSize: fs(13),
        fontWeight: '700',
        color: '#D9622A',
    },

    // "Booked" banner for driver's published rides that have bookings
    bookedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sp(6),
        backgroundColor: '#F2FAF5',
        borderWidth: 1,
        borderColor: '#3DAA6E',
        borderRadius: sp(10),
        paddingHorizontal: wp(12),
        paddingVertical: hp(8),
        marginBottom: hp(12),
    },
    bookedBannerText: {
        fontSize: fs(12),
        fontWeight: '700',
        color: '#3DAA6E',
    },
});
