// =============================================================================
// components/MyRides/styles.ts — Styles for My Rides Tab and Components
// =============================================================================

import { StyleSheet, Platform, StatusBar } from 'react-native';

export const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f5f5f5' },

    // Header 
    header: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + 16 : 50,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ebebeb',
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },

    // Custom Top Tabs
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
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
        color: '#888',
    },
    tabTextActive: {
        color: '#F37021',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -1,
        height: 3,
        backgroundColor: '#F37021',
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
        color: '#444',
        marginTop: 16,
    },
    emptySub: {
        fontSize: 14,
        color: '#888',
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
        borderColor: '#f0f0f0',
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
        borderTopColor: '#f5f5f5',
    },
    metaLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
    metaValue: { fontSize: 13, color: '#1a1a1a', fontWeight: '800' },

    // Cancel Booking button (passenger cards)
    cancelBookingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    cancelBookingBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#ef4444',
    },
});
