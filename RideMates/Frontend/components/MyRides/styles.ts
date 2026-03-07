// =============================================================================
// components/MyRides/styles.ts — Styles for My Rides Tab and Components
// =============================================================================

import { StyleSheet, Platform, StatusBar } from 'react-native';

export const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F0EB' },

    // Header 
    header: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + 12 : 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EAE0D8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#1E1610' },

    // Custom Top Tabs
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EAE0D8',
        position: 'relative',
        zIndex: 1,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B5344',
    },
    tabTextActive: {
        color: '#C24E00',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -1,
        height: 3,
        backgroundColor: '#C24E00',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        zIndex: 2,
    },

    // Main List Layout
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    listGap: {
        height: 12,
    },

    // Loading & Empty States
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3D2F22',
        marginTop: 16,
    },
    emptySub: {
        fontSize: 14,
        color: '#6B5344',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },

    // --- My Ride Card Extensions (Shared from RideCard, tweaked for history) ---
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EAE0D8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    statusBadgeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Role specific rows
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F5F0EB',
    },
    metaLabel: { fontSize: 11, color: '#6B5344', fontWeight: '600' },
    metaValue: { fontSize: 13, color: '#1E1610', fontWeight: '800' },

    // Cancel Booking button (passenger cards)
    cancelBookingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#FFF6F5',
        borderWidth: 1,
        borderColor: '#FCDCBF',
    },
    cancelBookingBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#D9622A',
    },

    // WhatsApp + Cancel side-by-side action row (passenger confirmed bookings)
    actionBtnRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    whatsappActionBtn: {
        backgroundColor: '#FEF0E4',
        borderColor: '#FCDCBF',
    },
    whatsappActionBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#C24E00',
    },
    cancelActionBtn: {
        backgroundColor: '#FFF6F5',
        borderColor: '#FCDCBF',
    },
    cancelActionBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#D9622A',
    },

    // "Booked" banner for driver's published rides that have bookings
    bookedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F2FAF5',
        borderWidth: 1,
        borderColor: '#3DAA6E',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    bookedBannerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#3DAA6E',
    },
});
