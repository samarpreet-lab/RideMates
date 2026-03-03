import { StyleSheet, Platform, StatusBar } from 'react-native';

export const s = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f5f5f5', gap: 12,
    },
    loadingText: { fontSize: 14, color: '#888' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        // backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    headerBackBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        flex: 1, textAlign: 'center',
        fontSize: 18, fontWeight: '800', color: '#1a1a1a',
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
        backgroundColor: '#fff4eb', alignItems: 'center', justifyContent: 'center',
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },

    // Field label
    fieldLabel: {
        fontSize: 11, fontWeight: '700', color: '#aaa',
        letterSpacing: 0.6, marginBottom: 6, marginTop: 14,
    },

    // Location field
    locationField: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#fafafa', borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: '#f0f0f0',
    },
    originDot: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#1a1a1a',
    },
    destDot: {
        width: 12, height: 12, borderRadius: 3,
        backgroundColor: '#F37021',
    },
    locationText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
    locationPlaceholder: { flex: 1, fontSize: 15, fontWeight: '500', color: '#bbb' },

    // Distance badge
    distanceBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#fff4eb', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8, marginTop: 12,
        alignSelf: 'flex-start',
    },
    distanceText: { fontSize: 13, fontWeight: '700', color: '#F37021' },

    // Date time row
    dateTimeRow: {
        flexDirection: 'row', gap: 12,
    },
    dateTimeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#fafafa', borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: '#f0f0f0',
    },
    dateTimeBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

    // Toggle row
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fafafa', borderRadius: 14, padding: 14, marginTop: 14,
        borderWidth: 1, borderColor: '#f0f0f0',
    },
    toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    toggleTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
    toggleSub: { fontSize: 10, color: '#aaa', marginTop: 1 },

    // Segmented picker
    segmentedRow: {
        flexDirection: 'row', gap: 12,
    },
    segmentBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 14,
        backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ececec',
    },
    segmentBtnActive: {
        backgroundColor: '#F37021', borderColor: '#F37021',
    },
    segmentLabel: { fontSize: 14, fontWeight: '700', color: '#666' },
    segmentLabelActive: { color: '#fff' },

    // Stepper
    stepperRow: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        alignSelf: 'flex-start',
    },
    stepperBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#ececec',
    },
    stepperValueBox: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    stepperValue: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },

    // Mileage input
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#fafafa', borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: '#f0f0f0',
    },
    textInput: {
        flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a1a', padding: 0,
    },
    inputSuffix: { fontSize: 12, fontWeight: '600', color: '#aaa' },

    // Chips (fuel type)
    chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ececec',
    },
    chipActive: { backgroundColor: '#F37021', borderColor: '#F37021' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#666' },
    chipTextActive: { color: '#fff' },

    // Price breakdown
    priceBreakdown: {
        backgroundColor: '#fafafa', borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: '#f0f0f0', gap: 8,
    },
    priceRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    priceRowHighlight: {
        borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 4,
    },
    priceLabel: { fontSize: 13, color: '#888' },
    priceValue: { fontSize: 13, fontWeight: '600', color: '#555' },
    priceLabelBold: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
    priceValueBold: { fontSize: 14, fontWeight: '800', color: '#F37021' },

    // Slider
    sliderContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4,
    },
    slider: { flex: 1, height: 40 },
    sliderMin: { fontSize: 11, fontWeight: '600', color: '#bbb' },
    sliderMax: { fontSize: 11, fontWeight: '600', color: '#bbb' },
    sliderValueRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 4,
    },
    sliderCurrentLabel: { fontSize: 14, color: '#888' },
    sliderCurrentValue: {
        fontSize: 24, fontWeight: '800', color: '#F37021',
    },
    perSeatNote: {
        textAlign: 'center', fontSize: 12, color: '#888', marginTop: 4,
    },

    // Price placeholder
    pricePlaceholder: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#fafafa', borderRadius: 14, padding: 20,
        borderWidth: 1, borderColor: '#f0f0f0',
    },
    pricePlaceholderText: { fontSize: 13, color: '#bbb', flex: 1 },

    // Acknowledgment checkbox
    ackRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: '#e3f2fd', borderRadius: 14, padding: 14, marginTop: 10,
        borderWidth: 1, borderColor: '#bbdefb',
    },
    ackRowChecked: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' },
    ackText: { fontSize: 12, color: '#1a1a1a', flex: 1, lineHeight: 18 },

    // Publish button
    publishBarWrap: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1, borderTopColor: '#f0f0f0',
    },
    publishBtn: {
        backgroundColor: '#F37021', borderRadius: 16, height: 54,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        elevation: 4, shadowColor: '#F37021',
        shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    publishBtnDisabled: { backgroundColor: '#ccc', elevation: 0, shadowOpacity: 0 },
    publishBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

    // Location picker modal
    locPickerSafe: { flex: 1, backgroundColor: '#fff' },
    locPickerHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    locPickerBackBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center',
    },
    locPickerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
    locPickerSearchBar: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: 16, marginVertical: 12,
        backgroundColor: '#f5f5f5', borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 10,
    },
    locPickerInput: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1a1a1a', padding: 0 },
    locPickerItem: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#f8f8f8',
    },
    locPickerIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#fff4eb', alignItems: 'center', justifyContent: 'center',
    },
    locPickerItemLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
    locPickerItemSub: { fontSize: 12, color: '#aaa', marginTop: 1 },
});
