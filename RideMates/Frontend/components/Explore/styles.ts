// =============================================================================
// components/Explore/styles.ts — All Explore (Home) Screen Styles
// =============================================================================

import { StyleSheet, Platform, StatusBar } from 'react-native';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAE0D8' },

  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F0EB', gap: 12,
  },
  loadingText: { fontSize: 14, color: '#6B5344' },

  // ─── Top Bar ──────────────────────────────────────────────────────────────
  topBarSafe: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 10, pointerEvents: 'box-none',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    marginHorizontal: 16, marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + 8 : 8,
    paddingHorizontal: 4, paddingVertical: 4,
  },

  // ─── Avatar / Role Badge ──────────────────────────────────────────────────
  avatarWrapper: { position: 'relative', width: 46, height: 46 },
  avatarRing: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#C24E00', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  roleBadge: {
    position: 'absolute', bottom: -1, right: -1,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  roleBadgeStudent: { backgroundColor: '#1976d2' },
  roleBadgeFaculty: { backgroundColor: '#7b1fa2' },

  // ─── Map Markers ──────────────────────────────────────────────────────────
  markerBubble: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.25,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    borderWidth: 2, borderColor: '#fff',
  },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    alignSelf: 'center', marginTop: -1,
  },

  // ─── My Location Button ──────────────────────────────────────────────────
  myLocationBtn: {
    position: 'absolute', right: 16, bottom: 270,
    backgroundColor: '#fff', width: 44, height: 44,
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    zIndex: 10,
  },

  // ─── Bottom Command Sheet ─────────────────────────────────────────────────
  commandSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.18,
    shadowRadius: 16, shadowOffset: { width: 0, height: -4 },
    overflow: 'hidden', zIndex: 10,
  },
  sheetHandle: { paddingHorizontal: 20, paddingBottom: 8 },
  handleBar: {
    width: 40, height: 4, backgroundColor: '#EAE0D8', borderRadius: 2,
    alignSelf: 'center', marginTop: 10, marginBottom: 12,
  },
  greetingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4,
  },
  greetingTitle: { fontSize: 17, fontWeight: '700', color: '#1E1610' },
  greetingSubtitle: { fontSize: 13, color: '#6B5344', marginTop: 2 },
  trustPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1,
  },
  trustPillText: { fontSize: 12, fontWeight: '700' },

  // ─── Search Bar Button ────────────────────────────────────────────────────
  searchBarBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF7F4', borderRadius: 14, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#EAE0D8', height: 50, marginBottom: 14,
  },
  searchBarBtnText: {
    flex: 1, paddingHorizontal: 10, fontSize: 14, color: '#A8937F',
  },
  searchBarArrow: {
    marginRight: 12, backgroundColor: '#FEF0E4',
    borderRadius: 8, padding: 4,
  },

  // ─── CTAs ─────────────────────────────────────────────────────────────────
  ctaRow: { paddingHorizontal: 16, gap: 10 },
  postRideBtn: {
    backgroundColor: '#C24E00', borderRadius: 14, height: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, elevation: 4,
    shadowColor: '#C24E00', shadowOpacity: 0.35,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  postRideBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // ─── Logout Card ──────────────────────────────────────────────────────────
  logoutSection: { marginTop: 18, paddingHorizontal: 16, paddingBottom: 8 },
  logoutCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF6F5', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#FCDCBF',
  },
  logoutIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF6F5', alignItems: 'center', justifyContent: 'center',
  },
  logoutTextWrap: { flex: 1 },
  logoutTitle: { fontSize: 14, fontWeight: '700', color: '#D9622A' },
  logoutEmail: { fontSize: 11, color: '#A84112', marginTop: 2, opacity: 0.7 },

  // ─── Search Modal ─────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 24,
    shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 20, shadowOffset: { width: 0, height: -6 },
  },
  modalSheetResults: {
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#EAE0D8', borderRadius: 2,
    alignSelf: 'center', marginTop: 10,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E1610' },
  modalCloseBtn: {
    backgroundColor: '#F5F0EB', borderRadius: 20, padding: 6,
  },
  modalBackBtn: {
    backgroundColor: '#F5F0EB', borderRadius: 20, padding: 6, marginRight: 8,
  },

  // ─── Route Card ───────────────────────────────────────────────────────────
  routeCard: {
    marginHorizontal: 16, backgroundColor: '#FAF7F4',
    borderRadius: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: '#EAE0D8',
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  originDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#1E1610', borderWidth: 2.5, borderColor: '#1E1610',
  },
  destDot: {
    width: 12, height: 12, borderRadius: 3,
    backgroundColor: '#C24E00',
  },
  routeDividerLine: {
    flex: 1, height: 2, backgroundColor: '#EAE0D8',
  },
  swapRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, marginVertical: -2,
  },
  routeFieldBox: { flex: 1 },
  routeFieldLabel: { fontSize: 10, fontWeight: '700', color: '#A8937F', letterSpacing: 0.6, marginBottom: 2 },
  routeFieldValue: { fontSize: 15, fontWeight: '700', color: '#1E1610' },
  routeFieldPlaceholder: { fontSize: 15, fontWeight: '500', color: '#A8937F' },
  routeFieldInput: { fontSize: 15, fontWeight: '600', color: '#1E1610', padding: 0 },
  swapBtn: {
    backgroundColor: '#FEF0E4', borderRadius: 20, padding: 6,
    borderWidth: 1, borderColor: '#FCDCBF',
  },

  // ─── Quick Select ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#6B5344',
    marginLeft: 20, marginBottom: 8, letterSpacing: 0.4,
  },
  quickSelectScroll: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: '#F5F0EB', borderRadius: 20,
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  quickChipActive: {
    backgroundColor: '#C24E00', borderColor: '#C24E00',
  },
  quickChipText: { fontSize: 13, fontWeight: '600', color: '#3D2F22' },
  quickChipTextActive: { color: '#fff' },

  // ─── Date Selector ────────────────────────────────────────────────────────
  dateSelectorScroll: { paddingLeft: 16, gap: 8 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#F5F0EB', borderRadius: 20,
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  dateChipActive: { backgroundColor: '#C24E00', borderColor: '#C24E00' },
  dateChipText: { fontSize: 12, fontWeight: '600', color: '#3D2F22' },
  dateChipTextActive: { color: '#fff' },

  // ─── Filter Row ───────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0, marginBottom: 16,
  },

  // ─── Seat Stepper ─────────────────────────────────────────────────────────
  seatStepper: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginRight: 16,
    backgroundColor: '#F5F0EB', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  stepperBtn: { padding: 2 },
  stepperValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepperValue: { fontSize: 13, fontWeight: '700', color: '#3D2F22' },

  // ─── Emergency Toggle ─────────────────────────────────────────────────────
  emergencyToggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#FEFDF2', borderRadius: 14,
    borderWidth: 1, borderColor: '#D4960F',
    marginBottom: 16,
  },
  emergencyToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  emergencyToggleTitle: { fontSize: 13, fontWeight: '700', color: '#1E1610' },
  emergencyToggleSub: { fontSize: 10, color: '#A8937F', marginTop: 1 },

  // ─── Search CTA ───────────────────────────────────────────────────────────
  searchRidesBtn: {
    marginHorizontal: 16, backgroundColor: '#C24E00', borderRadius: 16,
    height: 52, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    elevation: 4, shadowColor: '#C24E00',
    shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  searchRidesBtnDisabled: {
    backgroundColor: '#EAE0D8',
    shadowOpacity: 0,
  },
  searchRidesBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // ─── Results ──────────────────────────────────────────────────────────────
  resultsContainer: { flexShrink: 1, paddingBottom: 8 },
  resultsSummary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FAF7F4', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  resultsSummaryRoute: {
    flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1,
  },
  resultsSummaryText: { fontSize: 12, fontWeight: '600', color: '#6B5344' },
  resultsEditBtn: {
    backgroundColor: '#FEF0E4', borderRadius: 16, padding: 6,
  },
  resultsList: { paddingHorizontal: 16, paddingBottom: 16 },

  // ─── Empty State ──────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40, paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18, fontWeight: '700', color: '#6B5344', marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 13, color: '#A8937F', textAlign: 'center',
    marginTop: 6, lineHeight: 19,
  },
  emptyStateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, backgroundColor: '#FEF0E4',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: '#FCDCBF',
  },
  emptyStateBtnText: { fontSize: 13, fontWeight: '700', color: '#C24E00' },

  // ─── Ride Card ────────────────────────────────────────────────────────────
  rideCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#EAE0D8',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  rideCardTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  rideDriverInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rideDriverAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#C24E00', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  rideDriverInitials: { fontSize: 14, fontWeight: '800', color: '#fff' },
  rideDriverName: { fontSize: 14, fontWeight: '700', color: '#1E1610' },
  rideDriverMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rideTrustText: { fontSize: 11, fontWeight: '700' },
  rideMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#EAE0D8', marginHorizontal: 2 },
  rideVehicleText: { fontSize: 11, color: '#6B5344', textTransform: 'capitalize' },
  ridePriceBox: { alignItems: 'flex-end' },
  ridePriceLabel: { fontSize: 18, fontWeight: '800', color: '#1E1610' },
  ridePriceSub: { fontSize: 10, color: '#A8937F', marginTop: 1 },

  // Route timeline
  rideRouteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FAF7F4', borderRadius: 12, padding: 12,
    marginBottom: 10,
  },
  rideRouteTimeline: { alignItems: 'center', width: 14 },
  rideOriginDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1E1610', borderWidth: 2, borderColor: '#1E1610',
  },
  rideRouteLine: { width: 2, height: 20, backgroundColor: '#EAE0D8', marginVertical: 2 },
  rideDestDot: { width: 8, height: 8, borderRadius: 2, backgroundColor: '#C24E00' },
  rideRouteDetails: { flex: 1 },
  rideRouteCity: { fontSize: 12, fontWeight: '600', color: '#6B5344' },
  rideRouteDist: { fontSize: 10, color: '#A8937F', marginVertical: 2 },
  rideTimeBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rideTimeText: { fontSize: 11, fontWeight: '600', color: '#C24E00' },

  // Badges
  rideBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rideSeatBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  rideSeatText: { fontSize: 11, fontWeight: '600', color: '#1976d2' },
  rideEmergencyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEFDF2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    borderWidth: 1, borderColor: '#D4960F',
  },
  rideEmergencyText: { fontSize: 11, fontWeight: '600', color: '#D4960F' },
  rideFuelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F0EB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  rideFuelText: { fontSize: 11, color: '#6B5344', textTransform: 'capitalize' },

  // ─── Location Picker Modal ────────────────────────────────────────────────
  locPickerSafe: { flex: 1, backgroundColor: '#fff' },
  locPickerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EAE0D8',
    gap: 10,
  },
  locPickerBackBtn: { padding: 4 },
  locPickerTitle: { fontSize: 17, fontWeight: '700', color: '#1E1610', flex: 1 },
  locPickerInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 14, marginBottom: 6,
    borderWidth: 1.5, borderColor: '#C24E00', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#FFF8F2',
  },
  locPickerInput: {
    flex: 1, fontSize: 15, fontWeight: '600', color: '#1E1610',
    padding: 0,
  },
  locPickerSectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#A8937F',
    letterSpacing: 0.8, marginTop: 12, marginBottom: 4,
    marginHorizontal: 16,
  },
  locHubItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  locHubIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FEF0E4', justifyContent: 'center', alignItems: 'center',
  },
  locHubTextWrap: { flex: 1 },
  locHubName: { fontSize: 15, fontWeight: '700', color: '#1E1610' },
  locHubSubtitle: { fontSize: 12, color: '#6B5344', marginTop: 1 },
  locHubSeparator: { height: 1, backgroundColor: '#F5F0EB', marginLeft: 70 },
  locPickerQuickWrap: {
    borderTopWidth: 1, borderTopColor: '#EAE0D8',
    paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
  },
  locPickerQuickLabel: {
    fontSize: 11, fontWeight: '700', color: '#A8937F',
    letterSpacing: 0.6, marginLeft: 16, marginBottom: 2,
  },
  locQuickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: '#FEF0E4', borderRadius: 20,
    borderWidth: 1, borderColor: '#FCDCBF', marginRight: 8,
  },
  locQuickChipText: { fontSize: 13, fontWeight: '600', color: '#C24E00' },
});
