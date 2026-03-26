// =============================================================================
// components/Explore/styles.ts — All Explore (Home) Screen Styles
// =============================================================================

import { StyleSheet, Platform, StatusBar } from 'react-native';
import { sp, fs, wp, hp, SPACING, RADIUS } from '@/constants/responsive';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAE0D8' },

  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F0EB', gap: sp(12),
  },
  loadingText: { fontSize: fs(14), color: '#6B5344' },

  // ─── Top Bar ──────────────────────────────────────────────────────────────
  topBarSafe: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 10, pointerEvents: 'box-none',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    marginHorizontal: wp(16), marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) + hp(8) : hp(8),
    paddingHorizontal: wp(4), paddingVertical: hp(4),
  },

  // ─── Avatar / Role Badge ──────────────────────────────────────────────────
  avatarWrapper: { position: 'relative', width: sp(46), height: sp(46) },
  avatarRing: {
    width: sp(46), height: sp(46), borderRadius: sp(23),
    borderWidth: sp(2.5), alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: sp(4), shadowOffset: { width: 0, height: 1 },
  },
  avatarCircle: {
    width: sp(36), height: sp(36), borderRadius: sp(18),
    backgroundColor: '#C24E00', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: fs(14), fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  roleBadge: {
    position: 'absolute', bottom: -1, right: -1,
    width: sp(18), height: sp(18), borderRadius: sp(9),
    alignItems: 'center', justifyContent: 'center',
    borderWidth: sp(2), borderColor: '#fff',
  },
  roleBadgeStudent: { backgroundColor: '#1976d2' },
  roleBadgeFaculty: { backgroundColor: '#7b1fa2' },

  // ─── Map Markers ──────────────────────────────────────────────────────────
  markerBubble: {
    width: sp(28), height: sp(28), borderRadius: sp(14),
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.25,
    shadowRadius: sp(4), shadowOffset: { width: 0, height: 2 },
    borderWidth: sp(2), borderColor: '#fff',
  },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: sp(5), borderRightWidth: sp(5), borderTopWidth: sp(7),
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    alignSelf: 'center', marginTop: -1,
  },

  // ─── My Location Button ──────────────────────────────────────────────────
  myLocationBtn: {
    position: 'absolute', right: wp(16), bottom: hp(270),
    backgroundColor: '#fff', width: sp(44), height: sp(44),
    borderRadius: sp(22), alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: sp(6), shadowOffset: { width: 0, height: 3 },
    zIndex: 10,
  },

  // ─── Bottom Command Sheet ─────────────────────────────────────────────────
  commandSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: sp(24), borderTopRightRadius: sp(24),
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.18,
    shadowRadius: sp(16), shadowOffset: { width: 0, height: -4 },
    overflow: 'hidden', zIndex: 10,
  },
  sheetHandle: { paddingHorizontal: wp(20), paddingBottom: hp(8) },
  handleBar: {
    width: sp(40), height: sp(4), backgroundColor: '#EAE0D8', borderRadius: sp(2),
    alignSelf: 'center', marginTop: hp(10), marginBottom: hp(12),
  },
  greetingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: hp(4),
  },
  greetingTitle: { fontSize: fs(17), fontWeight: '700', color: '#1E1610' },
  greetingSubtitle: { fontSize: fs(13), color: '#6B5344', marginTop: hp(2) },
  trustPill: {
    flexDirection: 'row', alignItems: 'center', gap: sp(4),
    paddingHorizontal: wp(10), paddingVertical: hp(5), borderRadius: sp(20),
    borderWidth: 1,
  },
  trustPillText: { fontSize: fs(12), fontWeight: '700' },

  // ─── Search Bar Button ────────────────────────────────────────────────────
  searchBarBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF7F4', borderRadius: sp(14), marginHorizontal: wp(16),
    borderWidth: 1, borderColor: '#EAE0D8', height: hp(50), marginBottom: hp(14),
  },
  searchBarBtnText: {
    flex: 1, paddingHorizontal: wp(10), fontSize: fs(14), color: '#A8937F',
  },
  searchBarArrow: {
    marginRight: wp(12), backgroundColor: '#FEF0E4',
    borderRadius: sp(8), padding: sp(4),
  },

  // ─── CTAs ─────────────────────────────────────────────────────────────────
  ctaRow: { paddingHorizontal: wp(16), gap: sp(10) },
  postRideBtn: {
    backgroundColor: '#C24E00', borderRadius: sp(14), height: hp(50),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sp(8), elevation: 4,
    shadowColor: '#C24E00', shadowOpacity: 0.35,
    shadowRadius: sp(8), shadowOffset: { width: 0, height: 4 },
  },
  postRideBtnText: { color: '#fff', fontSize: fs(15), fontWeight: '700' },

  // ─── Logout Card ──────────────────────────────────────────────────────────
  logoutSection: { marginTop: hp(18), paddingHorizontal: wp(16), paddingBottom: hp(8) },
  logoutCard: {
    flexDirection: 'row', alignItems: 'center', gap: sp(12),
    backgroundColor: '#FFF6F5', borderRadius: sp(16),
    paddingHorizontal: wp(16), paddingVertical: hp(14),
    borderWidth: 1, borderColor: '#FCDCBF',
  },
  logoutIconWrap: {
    width: sp(36), height: sp(36), borderRadius: sp(18),
    backgroundColor: '#FFF6F5', alignItems: 'center', justifyContent: 'center',
  },
  logoutTextWrap: { flex: 1 },
  logoutTitle: { fontSize: fs(14), fontWeight: '700', color: '#D9622A' },
  logoutEmail: { fontSize: fs(11), color: '#A84112', marginTop: hp(2), opacity: 0.7 },

  // ─── Search Modal ─────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: sp(28), borderTopRightRadius: sp(28),
    paddingBottom: Platform.OS === 'ios' ? hp(34) : hp(20),
    elevation: 24,
    shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: sp(20), shadowOffset: { width: 0, height: -6 },
  },
  modalSheetResults: {
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? hp(34) : hp(20),
  },
  modalHandle: {
    width: sp(40), height: sp(4), backgroundColor: '#EAE0D8', borderRadius: sp(2),
    alignSelf: 'center', marginTop: hp(10),
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: wp(20), paddingTop: hp(14), paddingBottom: hp(12),
  },
  modalTitle: { fontSize: fs(18), fontWeight: '800', color: '#1E1610' },
  modalCloseBtn: {
    backgroundColor: '#F5F0EB', borderRadius: sp(20), padding: sp(6),
  },
  modalBackBtn: {
    backgroundColor: '#F5F0EB', borderRadius: sp(20), padding: sp(6), marginRight: wp(8),
  },

  // ─── Route Card ───────────────────────────────────────────────────────────
  routeCard: {
    marginHorizontal: wp(16), backgroundColor: '#FAF7F4',
    borderRadius: sp(16), paddingVertical: hp(6),
    borderWidth: 1, borderColor: '#EAE0D8',
    marginBottom: hp(16),
  },
  routeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wp(16), paddingVertical: hp(12), gap: sp(12),
  },
  originDot: {
    width: sp(12), height: sp(12), borderRadius: sp(6),
    backgroundColor: '#1E1610', borderWidth: sp(2.5), borderColor: '#1E1610',
  },
  destDot: {
    width: sp(12), height: sp(12), borderRadius: sp(3),
    backgroundColor: '#C24E00',
  },
  routeDividerLine: {
    flex: 1, height: sp(2), backgroundColor: '#EAE0D8',
  },
  swapRow: {
    flexDirection: 'row', alignItems: 'center', gap: sp(8),
    paddingHorizontal: wp(16), marginVertical: hp(-2),
  },
  routeFieldBox: { flex: 1 },
  routeFieldLabel: { fontSize: fs(10), fontWeight: '700', color: '#A8937F', letterSpacing: 0.6, marginBottom: hp(2) },
  routeFieldValue: { fontSize: fs(15), fontWeight: '700', color: '#1E1610' },
  routeFieldPlaceholder: { fontSize: fs(15), fontWeight: '500', color: '#A8937F' },
  routeFieldInput: { fontSize: fs(15), fontWeight: '600', color: '#1E1610', padding: 0 },
  swapBtn: {
    backgroundColor: '#FEF0E4', borderRadius: sp(20), padding: sp(6),
    borderWidth: 1, borderColor: '#FCDCBF',
  },

  // ─── Quick Select ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: fs(12), fontWeight: '700', color: '#6B5344',
    marginLeft: wp(20), marginBottom: hp(8), letterSpacing: 0.4,
  },
  quickSelectScroll: { paddingHorizontal: wp(16), gap: sp(8), marginBottom: hp(16) },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: sp(6),
    paddingHorizontal: wp(14), paddingVertical: hp(9),
    backgroundColor: '#F5F0EB', borderRadius: sp(20),
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  quickChipActive: {
    backgroundColor: '#C24E00', borderColor: '#C24E00',
  },
  quickChipText: { fontSize: fs(13), fontWeight: '600', color: '#3D2F22' },
  quickChipTextActive: { color: '#fff' },

  // ─── Date Selector ────────────────────────────────────────────────────────
  dateSelectorScroll: { paddingLeft: wp(16), gap: sp(8) },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: sp(5),
    paddingHorizontal: wp(12), paddingVertical: hp(8),
    backgroundColor: '#F5F0EB', borderRadius: sp(20),
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  dateChipActive: { backgroundColor: '#C24E00', borderColor: '#C24E00' },
  dateChipText: { fontSize: fs(12), fontWeight: '600', color: '#3D2F22' },
  dateChipTextActive: { color: '#fff' },

  // ─── Filter Row ───────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0, marginBottom: hp(16),
  },

  // ─── Seat Stepper ─────────────────────────────────────────────────────────
  seatStepper: {
    flexDirection: 'row', alignItems: 'center',
    gap: sp(8), marginRight: wp(16),
    backgroundColor: '#F5F0EB', borderRadius: sp(20),
    paddingHorizontal: wp(10), paddingVertical: hp(6),
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  stepperBtn: { padding: sp(2) },
  stepperValueWrap: { flexDirection: 'row', alignItems: 'center', gap: sp(4) },
  stepperValue: { fontSize: fs(13), fontWeight: '700', color: '#3D2F22' },

  // ─── Emergency Toggle ─────────────────────────────────────────────────────
  emergencyToggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: wp(16), paddingHorizontal: wp(14), paddingVertical: hp(12),
    backgroundColor: '#FEFDF2', borderRadius: sp(14),
    borderWidth: 1, borderColor: '#D4960F',
    marginBottom: hp(16),
  },
  emergencyToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: sp(10), flex: 1 },
  emergencyToggleTitle: { fontSize: fs(13), fontWeight: '700', color: '#1E1610' },
  emergencyToggleSub: { fontSize: fs(10), color: '#A8937F', marginTop: hp(1) },

  // ─── Search CTA ───────────────────────────────────────────────────────────
  searchRidesBtn: {
    marginHorizontal: wp(16), backgroundColor: '#C24E00', borderRadius: sp(16),
    height: hp(52), flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: sp(8),
    elevation: 4, shadowColor: '#C24E00',
    shadowOpacity: 0.35, shadowRadius: sp(8), shadowOffset: { width: 0, height: 4 },
  },
  searchRidesBtnDisabled: {
    backgroundColor: '#EAE0D8',
    shadowOpacity: 0,
  },
  searchRidesBtnText: { color: '#fff', fontSize: fs(16), fontWeight: '800' },

  // ─── Results ──────────────────────────────────────────────────────────────
  resultsContainer: { flexShrink: 1, paddingBottom: hp(8) },
  resultsSummary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: wp(16), marginBottom: hp(14),
    backgroundColor: '#FAF7F4', borderRadius: sp(12),
    paddingHorizontal: wp(14), paddingVertical: hp(10),
    borderWidth: 1, borderColor: '#EAE0D8',
  },
  resultsSummaryRoute: {
    flexDirection: 'row', alignItems: 'center', gap: sp(6), flex: 1,
  },
  resultsSummaryText: { fontSize: fs(12), fontWeight: '600', color: '#6B5344' },
  resultsEditBtn: {
    backgroundColor: '#FEF0E4', borderRadius: sp(16), padding: sp(6),
  },
  resultsList: { paddingHorizontal: wp(16), paddingBottom: hp(16) },

  // ─── Empty State ──────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: hp(40), paddingHorizontal: wp(32),
  },
  emptyStateTitle: {
    fontSize: fs(18), fontWeight: '700', color: '#6B5344', marginTop: hp(12),
  },
  emptyStateSub: {
    fontSize: fs(13), color: '#A8937F', textAlign: 'center',
    marginTop: hp(6), lineHeight: fs(19),
  },
  emptyStateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: sp(6),
    marginTop: hp(20), backgroundColor: '#FEF0E4',
    paddingHorizontal: wp(18), paddingVertical: hp(10), borderRadius: sp(20),
    borderWidth: 1, borderColor: '#FCDCBF',
  },
  emptyStateBtnText: { fontSize: fs(13), fontWeight: '700', color: '#C24E00' },

  // ─── Ride Card ────────────────────────────────────────────────────────────
  rideCard: {
    backgroundColor: '#fff', borderRadius: sp(16), padding: sp(16),
    borderWidth: 1, borderColor: '#EAE0D8',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: sp(6), shadowOffset: { width: 0, height: 2 },
  },
  rideCardTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: hp(14),
  },
  rideDriverInfo: { flexDirection: 'row', alignItems: 'center', gap: sp(10), flex: 1 },
  rideDriverAvatar: {
    width: sp(40), height: sp(40), borderRadius: sp(20),
    backgroundColor: '#C24E00', alignItems: 'center', justifyContent: 'center',
    borderWidth: sp(2),
  },
  rideDriverInitials: { fontSize: fs(14), fontWeight: '800', color: '#fff' },
  rideDriverName: { fontSize: fs(14), fontWeight: '700', color: '#1E1610' },
  rideDriverMeta: { flexDirection: 'row', alignItems: 'center', gap: sp(4), marginTop: hp(2) },
  rideTrustText: { fontSize: fs(11), fontWeight: '700' },
  rideMetaDot: { width: sp(3), height: sp(3), borderRadius: sp(1.5), backgroundColor: '#EAE0D8', marginHorizontal: wp(2) },
  rideVehicleText: { fontSize: fs(11), color: '#6B5344', textTransform: 'capitalize' },
  ridePriceBox: { alignItems: 'flex-end' },
  ridePriceLabel: { fontSize: fs(18), fontWeight: '800', color: '#1E1610' },
  ridePriceSub: { fontSize: fs(10), color: '#A8937F', marginTop: hp(1) },

  // Route timeline
  rideRouteRow: {
    flexDirection: 'row', alignItems: 'center', gap: sp(10),
    backgroundColor: '#FAF7F4', borderRadius: sp(12), padding: sp(12),
    marginBottom: hp(10),
  },
  rideRouteTimeline: { alignItems: 'center', width: sp(14) },
  rideOriginDot: {
    width: sp(8), height: sp(8), borderRadius: sp(4),
    backgroundColor: '#1E1610', borderWidth: sp(2), borderColor: '#1E1610',
  },
  rideRouteLine: { width: sp(2), height: sp(20), backgroundColor: '#EAE0D8', marginVertical: hp(2) },
  rideDestDot: { width: sp(8), height: sp(8), borderRadius: sp(2), backgroundColor: '#C24E00' },
  rideRouteDetails: { flex: 1 },
  rideRouteCity: { fontSize: fs(12), fontWeight: '600', color: '#6B5344' },
  rideRouteDist: { fontSize: fs(10), color: '#A8937F', marginVertical: hp(2) },
  rideTimeBox: { flexDirection: 'row', alignItems: 'center', gap: sp(4) },
  rideTimeText: { fontSize: fs(11), fontWeight: '600', color: '#C24E00' },

  // Badges
  rideBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: sp(8), flexWrap: 'wrap' },
  rideSeatBadge: {
    flexDirection: 'row', alignItems: 'center', gap: sp(4),
    backgroundColor: '#e3f2fd', paddingHorizontal: wp(10), paddingVertical: hp(5), borderRadius: sp(12),
  },
  rideSeatText: { fontSize: fs(11), fontWeight: '600', color: '#1976d2' },
  rideEmergencyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: sp(4),
    backgroundColor: '#FEFDF2', paddingHorizontal: wp(10), paddingVertical: hp(5), borderRadius: sp(12),
    borderWidth: 1, borderColor: '#D4960F',
  },
  rideEmergencyText: { fontSize: fs(11), fontWeight: '600', color: '#D4960F' },
  rideFuelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: sp(4),
    backgroundColor: '#F5F0EB', paddingHorizontal: wp(10), paddingVertical: hp(5), borderRadius: sp(12),
  },
  rideFuelText: { fontSize: fs(11), color: '#6B5344', textTransform: 'capitalize' },

  // ─── Location Picker Modal ────────────────────────────────────────────────
  locPickerSafe: { flex: 1, backgroundColor: '#fff' },
  locPickerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wp(12), paddingVertical: hp(14),
    borderBottomWidth: 1, borderBottomColor: '#EAE0D8',
    gap: sp(10),
  },
  locPickerBackBtn: { padding: sp(4) },
  locPickerTitle: { fontSize: fs(17), fontWeight: '700', color: '#1E1610', flex: 1 },
  locPickerInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: wp(16), marginTop: hp(14), marginBottom: hp(6),
    borderWidth: sp(1.5), borderColor: '#C24E00', borderRadius: sp(12),
    paddingHorizontal: wp(14), paddingVertical: Platform.OS === 'ios' ? hp(14) : hp(10),
    backgroundColor: '#FFF8F2',
  },
  locPickerInput: {
    flex: 1, fontSize: fs(15), fontWeight: '600', color: '#1E1610',
    padding: 0,
  },
  locPickerSectionLabel: {
    fontSize: fs(11), fontWeight: '800', color: '#A8937F',
    letterSpacing: 0.8, marginTop: hp(12), marginBottom: hp(4),
    marginHorizontal: wp(16),
  },
  locHubItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wp(16), paddingVertical: hp(14), gap: sp(14),
  },
  locHubIconWrap: {
    width: sp(40), height: sp(40), borderRadius: sp(20),
    backgroundColor: '#FEF0E4', justifyContent: 'center', alignItems: 'center',
  },
  locHubTextWrap: { flex: 1 },
  locHubName: { fontSize: fs(15), fontWeight: '700', color: '#1E1610' },
  locHubSubtitle: { fontSize: fs(12), color: '#6B5344', marginTop: hp(1) },
  locHubSeparator: { height: 1, backgroundColor: '#F5F0EB', marginLeft: wp(70) },
  locPickerQuickWrap: {
    borderTopWidth: 1, borderTopColor: '#EAE0D8',
    paddingTop: hp(6), paddingBottom: Platform.OS === 'ios' ? hp(28) : hp(12),
    backgroundColor: '#fff',
  },
  locPickerQuickLabel: {
    fontSize: fs(11), fontWeight: '700', color: '#A8937F',
    letterSpacing: 0.6, marginLeft: wp(16), marginBottom: hp(2),
  },
  locQuickChip: {
    flexDirection: 'row', alignItems: 'center', gap: sp(6),
    paddingHorizontal: wp(14), paddingVertical: hp(9),
    backgroundColor: '#FEF0E4', borderRadius: sp(20),
    borderWidth: 1, borderColor: '#FCDCBF', marginRight: wp(8),
  },
  locQuickChipText: { fontSize: fs(13), fontWeight: '600', color: '#C24E00' },

  // ─── Profile Modal ────────────────────────────────────────────────────────
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: sp(16),
    paddingTop: hp(30),
    paddingBottom: hp(24),
    paddingHorizontal: wp(20),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: sp(10),
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  profileModalClose: {
    position: 'absolute',
    top: hp(12),
    right: wp(12),
    padding: sp(4),
  },
  profileModalAvatarWrap: {
    width: sp(70), height: sp(70), borderRadius: sp(35),
    backgroundColor: '#D9622A',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: hp(16),
  },
  profileModalInitials: {
    fontSize: fs(26), fontWeight: '800', color: '#fff',
  },
  profileModalName: {
    fontSize: fs(20), fontWeight: '800', color: '#1B263B',
    marginBottom: hp(20),
  },
  profileModalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: hp(12),
  },
  profileModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: sp(12),
  },
  profileModalRowText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  profileModalTrustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: sp(6),
    gap: sp(4),
  },
  profileModalTrustBadgeText: {
    color: '#fff',
    fontSize: fs(12),
    fontWeight: 'bold',
  },
  profileModalTrustText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#1B263B',
  },
});
