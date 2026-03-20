import { StyleSheet, Platform, StatusBar } from 'react-native';

export const s = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F0EB',
    },
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F5F0EB', gap: 12,
    },
    loadingText: { fontSize: 14, color: '#6B5344' },

    // Header
    header: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + 12 : 50,
        paddingHorizontal: 16, paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#EAE0D8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },
    headerTitle: {
        fontSize: 24, fontWeight: '800', color: '#1E1610',
    },

    // Scrollview
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

    // Section card
    sectionCard: {
        backgroundColor: '#fff', borderRadius: 20,
        padding: 20, marginBottom: 16,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginBottom: 18,
    },
    sectionIconCircle: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#FEF0E4', alignItems: 'center', justifyContent: 'center',
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E1610' },

    // Field label
    fieldLabel: {
        fontSize: 11, fontWeight: '700', color: '#A8937F',
        letterSpacing: 0.6, marginBottom: 6, marginTop: 14,
    },

    // Location field
    locationField: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#FAF7F4', borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: '#EAE0D8',
    },
    originDot: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#1E1610',
    },
    destDot: {
        width: 12, height: 12, borderRadius: 3,
        backgroundColor: '#C24E00',
    },
    locationText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E1610' },
    locationPlaceholder: { flex: 1, fontSize: 15, fontWeight: '500', color: '#A8937F' },

    // Distance badge
    distanceBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FEF0E4', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8, marginTop: 12,
        alignSelf: 'flex-start',
    },
    distanceText: { fontSize: 13, fontWeight: '700', color: '#C24E00' },

    // Date time row
    dateTimeRow: {
        flexDirection: 'row', gap: 12,
    },
    dateTimeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FAF7F4', borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: '#EAE0D8',
    },
    dateTimeBtnText: { fontSize: 14, fontWeight: '600', color: '#1E1610' },

    // Toggle row
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FAF7F4', borderRadius: 14, padding: 14, marginTop: 14,
        borderWidth: 1, borderColor: '#EAE0D8',
    },
    toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    toggleTitle: { fontSize: 13, fontWeight: '700', color: '#1E1610' },
    toggleSub: { fontSize: 10, color: '#A8937F', marginTop: 1 },

    // Segmented picker
    segmentedRow: {
        flexDirection: 'row', gap: 12,
    },
    segmentBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 14,
        backgroundColor: '#F5F0EB', borderWidth: 1, borderColor: '#EAE0D8',
    },
    segmentBtnActive: {
        backgroundColor: '#C24E00', borderColor: '#C24E00',
    },
    segmentLabel: { fontSize: 14, fontWeight: '700', color: '#6B5344' },
    segmentLabelActive: { color: '#fff' },

    // Stepper
    stepperRow: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        alignSelf: 'flex-start',
    },
    stepperBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#EAE0D8',
    },
    stepperValueBox: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    stepperValue: { fontSize: 22, fontWeight: '800', color: '#1E1610' },

    // Mileage input
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#FAF7F4', borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: '#EAE0D8',
    },
    textInput: {
        flex: 1, fontSize: 15, fontWeight: '600', color: '#1E1610', padding: 0,
    },
    inputSuffix: { fontSize: 12, fontWeight: '600', color: '#A8937F' },

    // Chips (fuel type)
    chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        backgroundColor: '#F5F0EB', borderWidth: 1, borderColor: '#EAE0D8',
    },
    chipActive: { backgroundColor: '#C24E00', borderColor: '#C24E00' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#6B5344' },
    chipTextActive: { color: '#fff' },

    // Price breakdown
    priceBreakdown: {
        backgroundColor: '#FAF7F4', borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: '#EAE0D8', gap: 8,
    },
    priceDivider: { height: 1, backgroundColor: '#EAE0D8', marginVertical: 2 },
    priceRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    priceRowHighlight: {
        borderTopWidth: 1, borderTopColor: '#EAE0D8', paddingTop: 8, marginTop: 4,
    },
    priceZoneDot: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    zoneDot: { width: 8, height: 8, borderRadius: 4 },
    priceLabel: { fontSize: 13, color: '#6B5344' },
    priceValue: { fontSize: 13, fontWeight: '600', color: '#6B5344' },
    priceLabelBold: { fontSize: 14, fontWeight: '700', color: '#1E1610' },
    priceValueBold: { fontSize: 14, fontWeight: '800', color: '#C24E00' },

    // Slider
    sliderHeaderRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 14, marginBottom: 2,
    },
    zoneBadge: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, borderWidth: 1,
    },
    zoneBadgeText: { fontSize: 11, fontWeight: '700' },
    sliderContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4,
    },
    slider: { flex: 1, height: 40 },
    sliderMin: { fontSize: 11, fontWeight: '600', color: '#A8937F' },
    sliderMax: { fontSize: 11, fontWeight: '600', color: '#A8937F' },
    zoneMarkersRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: -4, marginBottom: 4, paddingHorizontal: 2,
    },
    zoneMarkerGreen: { fontSize: 10, color: '#388E3C' },
    zoneMarkerRed:   { fontSize: 10, color: '#C24E00' },
    sliderValueRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 4,
    },
    sliderCurrentLabel: { fontSize: 14, color: '#6B5344' },
    sliderCurrentValue: {
        fontSize: 24, fontWeight: '800', color: '#C24E00',
    },
    totalEarningsRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        marginTop: 4,
    },
    totalEarningsText: { fontSize: 12, color: '#6B5344' },
    perSeatNote: {
        textAlign: 'center', fontSize: 12, color: '#6B5344', marginTop: 4,
    },

    // Price placeholder
    pricePlaceholder: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FAF7F4', borderRadius: 14, padding: 20,
        borderWidth: 1, borderColor: '#EAE0D8',
    },
    pricePlaceholderText: { fontSize: 13, color: '#A8937F', flex: 1 },

    // Acknowledgment checkbox
    ackRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: '#e3f2fd', borderRadius: 14, padding: 14, marginTop: 10,
        borderWidth: 1, borderColor: '#bbdefb',
    },
    ackRowChecked: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' },
    ackText: { fontSize: 12, color: '#1E1610', flex: 1, lineHeight: 18 },

    // Publish button
    publishBarWrap: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1, borderTopColor: '#EAE0D8',
        elevation: 12, shadowColor: '#000',
        shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: -4 },
    },
    publishBtn: {
        backgroundColor: '#C24E00', borderRadius: 16, height: 54,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        elevation: 4, shadowColor: '#C24E00',
        shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    publishBtnDisabled: { backgroundColor: '#EAE0D8', elevation: 0, shadowOpacity: 0 },
    publishBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

    // Location picker modal
    locPickerSafe: { flex: 1, backgroundColor: '#fff' },
    locPickerHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#EAE0D8',
    },
    locPickerBackBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center',
    },
    locPickerTitle: { fontSize: 18, fontWeight: '800', color: '#1E1610' },
    locPickerSearchBar: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: 16, marginVertical: 12,
        backgroundColor: '#F5F0EB', borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 10,
    },
    locPickerInput: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1E1610', padding: 0 },
    locPickerItem: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#FAF7F4',
    },
    locPickerIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#FEF0E4', alignItems: 'center', justifyContent: 'center',
    },
    locPickerItemLabel: { fontSize: 15, fontWeight: '700', color: '#1E1610' },
    locPickerItemSub: { fontSize: 12, color: '#A8937F', marginTop: 1 },

    // Success Modal
    successOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    successCard: {
        width: '85%', backgroundColor: '#fff',
        borderRadius: 24, padding: 24, alignItems: 'center',
        elevation: 10, shadowColor: '#000',
        shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    },
    shieldGlow: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#FFE5D4',
        justifyContent: 'center', alignItems: 'center',
        elevation: 10, shadowColor: '#D9622A', shadowOpacity: 0.8,
        shadowRadius: 15, shadowOffset: { width: 0, height: 0 },
        marginBottom: 16,
    },
    networkPill: {
        backgroundColor: '#FFF2E8', paddingHorizontal: 16, paddingVertical: 6,
        borderRadius: 20, marginBottom: 16,
    },
    networkPillText: { fontSize: 10, fontWeight: '800', color: '#D9622A', letterSpacing: 1 },
    successTitle: { fontSize: 22, fontWeight: '800', color: '#1B263B', marginBottom: 12 },
    successMessage: {
        fontSize: 13, color: '#666', textAlign: 'center',
        lineHeight: 20, marginBottom: 20, paddingHorizontal: 4,
    },
    rideCardBox: {
        width: '100%', backgroundColor: '#F0F2F5',
        borderRadius: 16, padding: 16, marginBottom: 24,
    },
    rideCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    rideCardRouteTop: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#888' },
    rideCardRouteLine: { width: 1, height: 14, backgroundColor: '#888', marginLeft: 3, marginVertical: 2 },
    rideCardRouteText: { fontSize: 14, fontWeight: '700', color: '#1B263B', flex: 1 },
    rideCardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 20, marginBottom: 6 },
    rideCardSubText: { fontSize: 13, color: '#444', fontWeight: '500' },
    gotItBtn: {
        width: '100%', backgroundColor: '#C24E00',
        borderRadius: 12, paddingVertical: 14,
        alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
        marginBottom: 12,
    },
    gotItBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    viewDetailsBtn: { paddingVertical: 8, paddingHorizontal: 16 },
    viewDetailsText: { fontSize: 13, fontWeight: '700', color: '#C24E00' },
});

