import { StyleSheet, Platform, StatusBar } from 'react-native';
import { sp, fs, wp, hp } from '@/constants/responsive';

export const s = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F0EB',
    },
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F5F0EB', gap: sp(12),
    },
    loadingText: { fontSize: fs(14), color: '#6B5344' },

    // Header
    header: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + hp(12) : hp(50),
        paddingHorizontal: wp(16), paddingBottom: hp(16),
        backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#EAE0D8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: sp(4),
        shadowOffset: { width: 0, height: 1 },
    },
    headerTitle: {
        fontSize: fs(24), fontWeight: '800', color: '#1E1610',
    },

    // Scrollview
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: wp(16), paddingTop: hp(16) },

    // Section card
    sectionCard: {
        backgroundColor: '#fff', borderRadius: sp(20),
        padding: sp(20), marginBottom: hp(16),
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
        shadowRadius: sp(8), shadowOffset: { width: 0, height: 2 },
    },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: sp(10),
        marginBottom: hp(18),
    },
    sectionIconCircle: {
        width: sp(34), height: sp(34), borderRadius: sp(17),
        backgroundColor: '#FEF0E4', alignItems: 'center', justifyContent: 'center',
    },
    sectionTitle: { fontSize: fs(16), fontWeight: '800', color: '#1E1610' },

    // Field label
    fieldLabel: {
        fontSize: fs(11), fontWeight: '700', color: '#A8937F',
        letterSpacing: 0.6, marginBottom: hp(6), marginTop: hp(14),
    },

    // Location field
    locationField: {
        flexDirection: 'row', alignItems: 'center', gap: sp(12),
        backgroundColor: '#FAF7F4', borderRadius: sp(14),
        padding: sp(14), borderWidth: 1, borderColor: '#EAE0D8',
    },
    originDot: {
        width: sp(12), height: sp(12), borderRadius: sp(6),
        backgroundColor: '#1E1610',
    },
    destDot: {
        width: sp(12), height: sp(12), borderRadius: sp(3),
        backgroundColor: '#C24E00',
    },
    locationText: { flex: 1, fontSize: fs(15), fontWeight: '700', color: '#1E1610' },
    locationPlaceholder: { flex: 1, fontSize: fs(15), fontWeight: '500', color: '#A8937F' },

    // Distance badge
    distanceBadge: {
        flexDirection: 'row', alignItems: 'center', gap: sp(6),
        backgroundColor: '#FEF0E4', borderRadius: sp(12),
        paddingHorizontal: wp(12), paddingVertical: hp(8), marginTop: hp(12),
        alignSelf: 'flex-start',
    },
    distanceText: { fontSize: fs(13), fontWeight: '700', color: '#C24E00' },

    // Date time row
    dateTimeRow: {
        flexDirection: 'row', gap: sp(12),
    },
    dateTimeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: sp(8),
        backgroundColor: '#FAF7F4', borderRadius: sp(14),
        padding: sp(14), borderWidth: 1, borderColor: '#EAE0D8',
    },
    dateTimeBtnText: { fontSize: fs(14), fontWeight: '600', color: '#1E1610' },

    // Toggle row
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FAF7F4', borderRadius: sp(14), padding: sp(14), marginTop: hp(14),
        borderWidth: 1, borderColor: '#EAE0D8',
    },
    toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: sp(10), flex: 1 },
    toggleTitle: { fontSize: fs(13), fontWeight: '700', color: '#1E1610' },
    toggleSub: { fontSize: fs(10), color: '#A8937F', marginTop: hp(1) },

    // Segmented picker
    segmentedRow: {
        flexDirection: 'row', gap: sp(12),
    },
    segmentBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp(8),
        paddingVertical: hp(14), borderRadius: sp(14),
        backgroundColor: '#F5F0EB', borderWidth: 1, borderColor: '#EAE0D8',
    },
    segmentBtnActive: {
        backgroundColor: '#C24E00', borderColor: '#C24E00',
    },
    segmentLabel: { fontSize: fs(14), fontWeight: '700', color: '#6B5344' },
    segmentLabelActive: { color: '#fff' },

    // Stepper
    stepperRow: {
        flexDirection: 'row', alignItems: 'center', gap: sp(16),
        alignSelf: 'flex-start',
    },
    stepperBtn: {
        width: sp(40), height: sp(40), borderRadius: sp(20),
        backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#EAE0D8',
    },
    stepperValueBox: {
        flexDirection: 'row', alignItems: 'center', gap: sp(6),
    },
    stepperValue: { fontSize: fs(22), fontWeight: '800', color: '#1E1610' },

    // Mileage input
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: sp(10),
        backgroundColor: '#FAF7F4', borderRadius: sp(14),
        padding: sp(14), borderWidth: 1, borderColor: '#EAE0D8',
    },
    textInput: {
        flex: 1, fontSize: fs(15), fontWeight: '600', color: '#1E1610', padding: 0,
    },
    inputSuffix: { fontSize: fs(12), fontWeight: '600', color: '#A8937F' },

    // Chips (fuel type)
    chipsRow: { flexDirection: 'row', gap: sp(8), flexWrap: 'wrap' },
    chip: {
        paddingHorizontal: wp(16), paddingVertical: hp(10), borderRadius: sp(20),
        backgroundColor: '#F5F0EB', borderWidth: 1, borderColor: '#EAE0D8',
    },
    chipActive: { backgroundColor: '#C24E00', borderColor: '#C24E00' },
    chipText: { fontSize: fs(13), fontWeight: '600', color: '#6B5344' },
    chipTextActive: { color: '#fff' },

    // Price breakdown
    priceBreakdown: {
        backgroundColor: '#FAF7F4', borderRadius: sp(14), padding: sp(14),
        borderWidth: 1, borderColor: '#EAE0D8', gap: sp(8),
    },
    priceDivider: { height: 1, backgroundColor: '#EAE0D8', marginVertical: hp(2) },
    priceRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    priceRowHighlight: {
        borderTopWidth: 1, borderTopColor: '#EAE0D8', paddingTop: hp(8), marginTop: hp(4),
    },
    priceZoneDot: { flexDirection: 'row', alignItems: 'center', gap: sp(8), flex: 1 },
    zoneDot: { width: sp(8), height: sp(8), borderRadius: sp(4) },
    priceLabel: { fontSize: fs(13), color: '#6B5344' },
    priceValue: { fontSize: fs(13), fontWeight: '600', color: '#6B5344' },
    priceLabelBold: { fontSize: fs(14), fontWeight: '700', color: '#1E1610' },
    priceValueBold: { fontSize: fs(14), fontWeight: '800', color: '#C24E00' },

    // Slider
    sliderHeaderRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: hp(14), marginBottom: hp(2),
    },
    zoneBadge: {
        paddingHorizontal: wp(10), paddingVertical: hp(4),
        borderRadius: sp(20), borderWidth: 1,
    },
    zoneBadgeText: { fontSize: fs(11), fontWeight: '700' },
    sliderContainer: {
        flexDirection: 'row', alignItems: 'center', gap: sp(8), marginTop: hp(4),
    },
    slider: { flex: 1, height: sp(40) },
    sliderMin: { fontSize: fs(11), fontWeight: '600', color: '#A8937F' },
    sliderMax: { fontSize: fs(11), fontWeight: '600', color: '#A8937F' },
    zoneMarkersRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: hp(-4), marginBottom: hp(4), paddingHorizontal: wp(2),
    },
    zoneMarkerGreen: { fontSize: fs(10), color: '#388E3C' },
    zoneMarkerRed:   { fontSize: fs(10), color: '#C24E00' },
    sliderValueRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp(8),
        marginTop: hp(4),
    },
    sliderCurrentLabel: { fontSize: fs(14), color: '#6B5344' },
    sliderCurrentValue: {
        fontSize: fs(24), fontWeight: '800', color: '#C24E00',
    },
    totalEarningsRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp(6),
        marginTop: hp(4),
    },
    totalEarningsText: { fontSize: fs(12), color: '#6B5344' },
    perSeatNote: {
        textAlign: 'center', fontSize: fs(12), color: '#6B5344', marginTop: hp(4),
    },

    // Price placeholder
    pricePlaceholder: {
        flexDirection: 'row', alignItems: 'center', gap: sp(8),
        backgroundColor: '#FAF7F4', borderRadius: sp(14), padding: sp(20),
        borderWidth: 1, borderColor: '#EAE0D8',
    },
    pricePlaceholderText: { fontSize: fs(13), color: '#A8937F', flex: 1 },

    // Acknowledgment checkbox
    ackRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: sp(10),
        backgroundColor: '#e3f2fd', borderRadius: sp(14), padding: sp(14), marginTop: hp(10),
        borderWidth: 1, borderColor: '#bbdefb',
    },
    ackRowChecked: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' },
    ackText: { fontSize: fs(12), color: '#1E1610', flex: 1, lineHeight: fs(18) },

    // Publish button
    publishBarWrap: {
        backgroundColor: '#fff', paddingHorizontal: wp(16), paddingVertical: hp(12),
        paddingBottom: Platform.OS === 'ios' ? hp(34) : hp(16),
        borderRadius: sp(20),
        borderTopWidth: 1, borderTopColor: '#EAE0D8',
        elevation: 12, shadowColor: '#000',
        shadowOpacity: 0.1, shadowRadius: sp(8), shadowOffset: { width: 0, height: -4 },
    },
    publishBtn: {
        backgroundColor: '#C24E00', borderRadius: sp(27), height: sp(54),
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp(8),
        elevation: 4, shadowColor: '#C24E00',
        shadowOpacity: 0.35, shadowRadius: sp(8), shadowOffset: { width: 0, height: 4 },
        overflow: 'hidden',
    },
    publishBtnDisabled: { backgroundColor: '#EAE0D8', elevation: 0, shadowOpacity: 0 },
    publishBtnText: { fontSize: fs(16), fontWeight: '800', color: '#fff' },

    // Location picker modal
    locPickerSafe: { flex: 1, backgroundColor: '#fff' },
    locPickerHeader: {
        flexDirection: 'row', alignItems: 'center', gap: sp(12),
        paddingHorizontal: wp(16), paddingVertical: hp(14),
        borderBottomWidth: 1, borderBottomColor: '#EAE0D8',
    },
    locPickerBackBtn: {
        width: sp(36), height: sp(36), borderRadius: sp(18),
        backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center',
    },
    locPickerTitle: { fontSize: fs(18), fontWeight: '800', color: '#1E1610' },
    locPickerSearchBar: {
        flexDirection: 'row', alignItems: 'center', gap: sp(10),
        marginHorizontal: wp(16), marginVertical: hp(12),
        backgroundColor: '#F5F0EB', borderRadius: sp(14),
        paddingHorizontal: wp(14), paddingVertical: hp(10),
    },
    locPickerInput: { flex: 1, fontSize: fs(15), fontWeight: '500', color: '#1E1610', padding: 0 },
    locPickerItem: {
        flexDirection: 'row', alignItems: 'center', gap: sp(14),
        paddingHorizontal: wp(16), paddingVertical: hp(14),
        borderBottomWidth: 1, borderBottomColor: '#FAF7F4',
    },
    locPickerIcon: {
        width: sp(40), height: sp(40), borderRadius: sp(20),
        backgroundColor: '#FEF0E4', alignItems: 'center', justifyContent: 'center',
    },
    locPickerItemLabel: { fontSize: fs(15), fontWeight: '700', color: '#1E1610' },
    locPickerItemSub: { fontSize: fs(12), color: '#A8937F', marginTop: hp(1) },

    // Success Modal
    successOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    successCard: {
        width: '85%', backgroundColor: '#fff',
        borderRadius: sp(24), padding: sp(24), alignItems: 'center',
        elevation: 10, shadowColor: '#000',
        shadowOpacity: 0.15, shadowRadius: sp(16), shadowOffset: { width: 0, height: 4 },
    },
    shieldGlow: {
        width: sp(80), height: sp(80), borderRadius: sp(40),
        backgroundColor: '#FFE5D4',
        justifyContent: 'center', alignItems: 'center',
        elevation: 10, shadowColor: '#D9622A', shadowOpacity: 0.8,
        shadowRadius: sp(15), shadowOffset: { width: 0, height: 0 },
        marginBottom: hp(16),
    },
    networkPill: {
        backgroundColor: '#FFF2E8', paddingHorizontal: wp(16), paddingVertical: hp(6),
        borderRadius: sp(20), marginBottom: hp(16),
    },
    networkPillText: { fontSize: fs(10), fontWeight: '800', color: '#D9622A', letterSpacing: 1 },
    successTitle: { fontSize: fs(22), fontWeight: '800', color: '#1B263B', marginBottom: hp(12) },
    successMessage: {
        fontSize: fs(13), color: '#666', textAlign: 'center',
        lineHeight: fs(20), marginBottom: hp(20), paddingHorizontal: wp(4),
    },
    rideCardBox: {
        width: '100%', backgroundColor: '#F0F2F5',
        borderRadius: sp(16), padding: sp(16), marginBottom: hp(24),
    },
    rideCardRow: { flexDirection: 'row', alignItems: 'center', gap: sp(12), marginBottom: hp(10) },
    rideCardRouteTop: { width: sp(8), height: sp(8), borderRadius: sp(4), backgroundColor: '#888' },
    rideCardRouteLine: { width: 1, height: sp(14), backgroundColor: '#888', marginLeft: sp(3), marginVertical: hp(2) },
    rideCardRouteText: { fontSize: fs(14), fontWeight: '700', color: '#1B263B', flex: 1 },
    rideCardSubRow: { flexDirection: 'row', alignItems: 'center', gap: sp(12), marginLeft: wp(20), marginBottom: hp(6) },
    rideCardSubText: { fontSize: fs(13), color: '#444', fontWeight: '500' },
    gotItBtn: {
        width: '100%', backgroundColor: '#C24E00',
        borderRadius: sp(12), paddingVertical: hp(14),
        alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: sp(6),
        marginBottom: hp(12),
    },
    gotItBtnText: { fontSize: fs(16), fontWeight: '700', color: '#fff' },
    viewDetailsBtn: { paddingVertical: hp(8), paddingHorizontal: wp(16) },
    viewDetailsText: { fontSize: fs(13), fontWeight: '700', color: '#C24E00' },
});

