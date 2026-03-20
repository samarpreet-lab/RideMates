// =============================================================================
// components/ui/SkeletonLoader.tsx — Reusable Skeleton Loading Components
// =============================================================================
// Animated pulse skeleton placeholders that mimic the layout of each screen
// while data is being fetched. Uses the app's warm LPU color palette.
//
// Usage:
//   import { ExploreSkeleton } from '../components/ui/SkeletonLoader';
//   if (loading) return <ExploreSkeleton />;
// =============================================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const STATUS_BAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) : 0;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// SkeletonBox — The core building block
// =============================================================================
// A single animated placeholder rectangle with a smooth pulse animation.
// All screen-specific skeletons are composed from these boxes.
// =============================================================================

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonBox({ width, height, borderRadius = 8, style }: SkeletonBoxProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#EAE0D8',
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}


// =============================================================================
// ExploreSkeleton — Mimics the Explore/Home screen layout
// =============================================================================
// Shows a map-like background area + bottom command sheet outline with
// greeting row, search bar, and CTA button placeholders.
// =============================================================================

export function ExploreSkeleton() {
  return (
    <View style={sk.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Map placeholder area */}
      <View style={sk.mapPlaceholder}>
        <SkeletonBox width={80} height={80} borderRadius={40} style={sk.mapCenterIcon} />
      </View>

      {/* Top bar - Avatar placeholder */}
      <View style={sk.topBarAbsolute}>
        <SkeletonBox width={46} height={46} borderRadius={23} />
      </View>

      {/* Bottom sheet skeleton */}
      <View style={sk.bottomSheet}>
        {/* Handle bar */}
        <View style={sk.handleBar} />

        {/* Greeting row */}
        <View style={sk.sheetPadding}>
          <View style={sk.row}>
            <View style={{ flex: 1 }}>
              <SkeletonBox width={180} height={18} borderRadius={6} />
              <SkeletonBox width={120} height={14} borderRadius={6} style={{ marginTop: 6 }} />
            </View>
            <SkeletonBox width={80} height={30} borderRadius={15} />
          </View>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SkeletonBox width={'100%' as any} height={50} borderRadius={14} />
        </View>

        {/* CTA button */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SkeletonBox width={'100%' as any} height={50} borderRadius={14} />
        </View>
      </View>
    </View>
  );
}


// =============================================================================
// MyRidesSkeleton — Mimics the My Rides screen layout
// =============================================================================
// Shows the header, tab bar, and a list of 3 card placeholders.
// =============================================================================

export function MyRidesSkeleton() {
  return (
    <View style={sk.listPadding}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={sk.card}>
          {/* Status badge */}
          <View style={sk.row}>
            <SkeletonBox width={80} height={22} borderRadius={12} />
            <SkeletonBox width={60} height={16} borderRadius={6} />
          </View>

          {/* Route row */}
          <View style={[sk.row, { marginTop: 14 }]}>
            <SkeletonBox width={12} height={12} borderRadius={6} />
            <SkeletonBox width={140} height={16} borderRadius={6} />
            <View style={{ width: 20 }} />
            <SkeletonBox width={12} height={12} borderRadius={3} />
            <SkeletonBox width={120} height={16} borderRadius={6} />
          </View>

          {/* Time + Price row */}
          <View style={[sk.row, { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F0EB' }]}>
            <SkeletonBox width={100} height={14} borderRadius={6} />
            <SkeletonBox width={60} height={18} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}


// =============================================================================
// RideDetailsSkeleton — Mimics the Ride Details screen layout
// =============================================================================
// Shows header + driver info card + route timeline + price breakdown + badges.
// =============================================================================

export function RideDetailsSkeleton() {
  return (
    <View style={sk.screenRoot}>
      {/* Header */}
      <View style={sk.detailHeader}>
        <SkeletonBox width={38} height={38} borderRadius={19} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBox width={200} height={18} borderRadius={6} />
          <SkeletonBox width={90} height={14} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {/* Driver Info Card */}
        <View style={sk.card}>
          <View style={sk.row}>
            <SkeletonBox width={52} height={52} borderRadius={26} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonBox width={140} height={16} borderRadius={6} />
              <View style={[sk.row, { marginTop: 6, gap: 6 }]}>
                <SkeletonBox width={60} height={14} borderRadius={6} />
                <SkeletonBox width={80} height={14} borderRadius={6} />
              </View>
            </View>
          </View>
        </View>

        {/* Route Timeline Card */}
        <View style={[sk.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {/* Timeline dots */}
            <View style={{ alignItems: 'center', width: 18, paddingTop: 4 }}>
              <SkeletonBox width={14} height={14} borderRadius={7} />
              <View style={{ width: 2, height: 50, backgroundColor: '#EAE0D8', marginVertical: 4 }} />
              <SkeletonBox width={14} height={14} borderRadius={4} />
            </View>
            {/* Route details */}
            <View style={{ flex: 1 }}>
              <SkeletonBox width={60} height={10} borderRadius={4} />
              <SkeletonBox width={160} height={18} borderRadius={6} style={{ marginTop: 4 }} />
              <View style={[sk.row, { marginTop: 14, marginBottom: 14, gap: 8 }]}>
                <SkeletonBox width={16} height={16} borderRadius={4} />
                <SkeletonBox width={100} height={14} borderRadius={6} />
              </View>
              <SkeletonBox width={60} height={10} borderRadius={4} />
              <SkeletonBox width={130} height={18} borderRadius={6} style={{ marginTop: 4 }} />
            </View>
          </View>
          {/* Departure time */}
          <SkeletonBox width={'100%' as any} height={40} borderRadius={12} style={{ marginTop: 14 }} />
        </View>

        {/* Badges row */}
        <View style={[sk.row, { marginTop: 12, gap: 8 }]}>
          <SkeletonBox width={90} height={30} borderRadius={20} />
          <SkeletonBox width={110} height={30} borderRadius={20} />
          <SkeletonBox width={80} height={30} borderRadius={20} />
        </View>

        {/* Price Breakdown Card */}
        <View style={[sk.card, { marginTop: 12 }]}>
          <View style={sk.row}>
            <SkeletonBox width={100} height={14} borderRadius={6} />
            <SkeletonBox width={60} height={14} borderRadius={6} />
          </View>
          <View style={[sk.row, { marginTop: 10 }]}>
            <SkeletonBox width={120} height={14} borderRadius={6} />
            <SkeletonBox width={70} height={14} borderRadius={6} />
          </View>
          <View style={{ height: 1, backgroundColor: '#EAE0D8', marginVertical: 10 }} />
          <View style={sk.row}>
            <SkeletonBox width={80} height={18} borderRadius={6} />
            <SkeletonBox width={80} height={22} borderRadius={6} />
          </View>
        </View>
      </View>

      {/* Bottom Bar */}
      <View style={sk.detailBottomBar}>
        <SkeletonBox width={80} height={14} borderRadius={6} />
        <SkeletonBox width={140} height={52} borderRadius={16} />
      </View>
    </View>
  );
}


// =============================================================================
// PostRideSkeleton — Mimics the Post a Ride screen layout
// =============================================================================
// Shows header + 3 form section card placeholders (Route, Vehicle, Pricing).
// =============================================================================

export function PostRideSkeleton() {
  return (
    <View style={sk.screenRoot}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={sk.header}>
        <SkeletonBox width={140} height={24} borderRadius={8} />
      </View>

      {/* Form sections */}
      <View style={{ padding: 16 }}>
        {/* Route Section */}
        <View style={sk.formCard}>
          <View style={sk.row}>
            <SkeletonBox width={34} height={34} borderRadius={17} />
            <SkeletonBox width={100} height={16} borderRadius={6} />
          </View>
          <SkeletonBox width={'100%' as any} height={50} borderRadius={14} style={{ marginTop: 16 }} />
          <SkeletonBox width={'100%' as any} height={50} borderRadius={14} style={{ marginTop: 10 }} />
          <View style={[sk.row, { marginTop: 10, gap: 12 }]}>
            <SkeletonBox width={'48%' as any} height={50} borderRadius={14} />
            <SkeletonBox width={'48%' as any} height={50} borderRadius={14} />
          </View>
        </View>

        {/* Vehicle Section */}
        <View style={sk.formCard}>
          <View style={sk.row}>
            <SkeletonBox width={34} height={34} borderRadius={17} />
            <SkeletonBox width={120} height={16} borderRadius={6} />
          </View>
          <View style={[sk.row, { marginTop: 16, gap: 12 }]}>
            <SkeletonBox width={'48%' as any} height={50} borderRadius={14} />
            <SkeletonBox width={'48%' as any} height={50} borderRadius={14} />
          </View>
          <SkeletonBox width={160} height={40} borderRadius={14} style={{ marginTop: 10 }} />
        </View>

        {/* Pricing Section */}
        <View style={sk.formCard}>
          <View style={sk.row}>
            <SkeletonBox width={34} height={34} borderRadius={17} />
            <SkeletonBox width={110} height={16} borderRadius={6} />
          </View>
          <SkeletonBox width={'100%' as any} height={80} borderRadius={14} style={{ marginTop: 16 }} />
          <SkeletonBox width={'100%' as any} height={40} borderRadius={14} style={{ marginTop: 10 }} />
        </View>
      </View>
    </View>
  );
}


// =============================================================================
// Styles
// =============================================================================

const sk = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAE0D8' },
  screenRoot: { flex: 1, backgroundColor: '#F5F0EB' },

  // Map placeholder
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#EAE0D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCenterIcon: { opacity: 0.3 },

  // Top bar
  topBarAbsolute: {
    position: 'absolute',
    top: STATUS_BAR_H + 8,
    right: 16,
    zIndex: 10,
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#EAE0D8',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sheetPadding: { paddingHorizontal: 20 },

  // Common
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Header
  header: {
    paddingTop: STATUS_BAR_H + 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE0D8',
  },

  // Detail header
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: STATUS_BAR_H + 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE0D8',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE0D8',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAE0D8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  // Form card (Post Ride)
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  // List padding
  listPadding: {
    padding: 16,
    gap: 12,
  },

  // Detail bottom bar
  detailBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EAE0D8',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
});
