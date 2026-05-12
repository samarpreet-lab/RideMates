// =============================================================================
// post-ride.tsx — Post a Ride Screen (Wizard Layout)
// =============================================================================
// Transformed into manageable components: RouteSection, VehicleSection, PricingSection
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, StatusBar, KeyboardAvoidingView
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Local dependencies
import api, { deleteToken } from '../../services/api';
import { VEHICLE_TYPES, FUEL_RATES, VEHICLE_MULTIPLIERS, VEHICLE_CAPACITIES, BASE_FARE, HUB_COORDS } from '../../components/PostRide/constants';
import { s } from '../../components/PostRide/styles';
import { sp } from '../../constants/responsive';

// Sub-components
import RouteSection from '../../components/PostRide/RouteSection';
import VehicleSection from '../../components/PostRide/VehicleSection';
import PricingSection from '../../components/PostRide/PricingSection';
import LocationPickerModal from '../../components/PostRide/LocationPickerModal';
import RideStatusModal from '../../components/ui/RideStatusModal';
import { formatDistanceKm } from '../../components/Explore/constants';
import { useAlert } from '../../components/ui/AlertContext';
import { PostRideSkeleton } from '../../components/ui/SkeletonLoader';

// ─── Types ──────────────────────────────────────────────────────────────────
interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  gender: string;
  trust_score: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getCoords(city: string): { lat: number; lng: number } | null {
  return HUB_COORDS[city] ?? null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3 * 100) / 100; // 1.3x road factor
}

function round2(n: number): number {
  return Math.round(n);
}

export default function PostRideScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  // FIX: Add error state for retry capability
  const [loadError, setLoadError] = useState<string | null>(null);

  // Calculate tab bar height to add as bottom padding
  const tabBarHeight = sp(56) + (Platform.OS === 'android' ? Math.max(insets.bottom, sp(8)) : sp(8));

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdRideId, setCreatedRideId] = useState<string | null>(null);
  const [actualDistance, setActualDistance] = useState<number | null>(null);

  // --- Section A: Route ---
  const [origin, setOrigin] = useState('LPU Main Gate');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEmergencyRoute, setIsEmergencyRoute] = useState(false);

  // --- Section B: Vehicle ---
  const [vehicleType, setVehicleType] = useState<'bike' | 'car'>('car');
  const [seats, setSeats] = useState(3);
  const [mileage, setMileage] = useState('15');
  const [fuelType, setFuelType] = useState('petrol');

  // --- Section C: Pricing ---
  const [driverPrice, setDriverPrice] = useState(0);
  const [instantBooking, setInstantBooking] = useState(false);
  const [instantAck, setInstantAck] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);

  // --- Derived ---
  const [distanceKm, setDistanceKm] = useState(0);

  // --- Location picker ---
  const [locPickerTarget, setLocPickerTarget] = useState<'origin' | 'destination' | null>(null);
  const [locQuery, setLocQuery] = useState('');
  // Coords from Photon for cities not in HUB_COORDS
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);

  // --- Load user profile ---
  const loadProfile = async () => {
    setLoadError(null);
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        await deleteToken();
        router.replace('/(tabs)/login');
      } else {
        // FIX: Set error state for retry UI
        setLoadError(error.response?.data?.message || 'Could not load profile. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [])
  );

  // --- Compute distance when both cities set ---
  useEffect(() => {
    if (!origin || !destination) {
      setDistanceKm(0);
      return;
    }

    const o = getCoords(origin) || originCoords;
    const d = getCoords(destination) || destCoords;

    if (!o || !d) {
      setDistanceKm(0);
      return;
    }

    const controller = new AbortController();
    let didCancel = false;

    const fetchRouteDistance = async () => {
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${d.lng},${d.lat}?overview=false`;
        const response = await fetch(osrmUrl, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`OSRM responded with ${response.status}`);
        }

        const data = await response.json();
        const routeMeters = data?.routes?.[0]?.distance;
        if (typeof routeMeters !== 'number' || routeMeters <= 0) {
          throw new Error('No valid route distance received');
        }

        if (!didCancel) {
          setDistanceKm(Math.round((routeMeters / 1000) * 100) / 100);
        }
      } catch {
        if (didCancel || controller.signal.aborted) return;
        // Safe fallback when route API is temporarily unavailable.
        const fallbackKm = haversineKm(o.lat, o.lng, d.lat, d.lng);
        setDistanceKm(fallbackKm);
      }
    };

    fetchRouteDistance();

    return () => {
      didCancel = true;
      controller.abort();
    };
  }, [origin, destination, originCoords, destCoords]);

  // --- Update mileage default on vehicle type change ---
  useEffect(() => {
    const vt = VEHICLE_TYPES.find((v) => v.id === vehicleType);
    if (vt) setMileage(String(vt.defaultMileage));
    // Reset seats for bike
    if (vehicleType === 'bike' && seats > 1) setSeats(1);
  }, [vehicleType, seats]);

  // --- Price calculations (per-seat model — SRS v2.0 with capacity divisor) ---
  const fuelRate = FUEL_RATES[fuelType] || 105;
  const mileageNum = parseFloat(mileage) || 15;
  const basePrice = distanceKm > 0 ? round2((distanceKm * fuelRate) / mileageNum) : 0; // total fuel cost
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.25;
  const baseFare = BASE_FARE[vehicleType] || 40;
  const standardCapacity = VEHICLE_CAPACITIES[vehicleType] || 5;

  // Capacity divisor: divide by vehicle's FULL capacity, not just offered seats
  // This ensures true cost-sharing: a driver offering 1 seat doesn't pay 100% of fuel
  const capacityDivisor = Math.max(seats + 1, standardCapacity);

  // Per-seat zone boundaries
  const basePerSeat = (basePrice > 0) ? round2(basePrice / capacityDivisor) : 0; // fuel cost per seat
  const recommendedPerSeat = round2(basePerSeat * 1.2);                          // green zone ceiling
  const maxPerSeat = basePerSeat > 0 ? baseFare + round2(basePerSeat * multiplier) : 0; // hard cap: base_fare + (per_seat * multiplier)

  // driverPrice is per-seat; cappedPrice is what gets stored in DB
  const cappedPrice = Math.min(driverPrice, maxPerSeat || driverPrice);
  const totalEarnings = seats > 0 ? round2(cappedPrice * seats) : 0;

  // Init slider to hard cap (max per seat) when route or seats change
  useEffect(() => {
    if (maxPerSeat > 0) setDriverPrice(maxPerSeat);
  }, [maxPerSeat]);

  // --- Validation ---
  const canPublish = (): boolean => {
    if (!origin.trim() || !destination.trim()) return false;
    if (origin === destination) return false;
    if (distanceKm <= 0) return false;
    if (driverPrice <= 0) return false;
    if (instantBooking && !instantAck) return false;
    // FIX: Validate mileage is a reasonable number
    if (mileageNum < 5 || mileageNum > 100) return false;
    return true;
  };

  // --- Combine date + time in LOCAL timezone (not UTC) for MySQL DATETIME format ---
  const getDepartureUTC = (): string => {
    const d = new Date(departureDate);
    d.setHours(departureTime.getHours(), departureTime.getMinutes(), 0, 0);
    // Keep local time instead of converting to UTC
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
  };

  // --- Publish ---
  const handlePublish = async () => {
    if (!canPublish()) return;
    const oCoords = getCoords(origin) || originCoords;
    const dCoords = getCoords(destination) || destCoords;

    setPublishing(true);
    try {
      const body = {
        origin_city: origin,
        origin_lat: oCoords?.lat || 0,
        origin_lng: oCoords?.lng || 0,
        destination_city: destination,
        dest_lat: dCoords?.lat || 0,
        dest_lng: dCoords?.lng || 0,
        distance_km: distanceKm,
        departure_time: getDepartureUTC(),
        available_seats: seats,
        vehicle_type: vehicleType,
        vehicle_mileage: mileageNum,
        fuel_type: fuelType,
        driver_set_price: driverPrice,
        is_emergency_route: isEmergencyRoute,
        is_women_only: womenOnly,
        instant_booking: instantBooking,
        instant_booking_ack: instantBooking ? instantAck : false,
      };

      const res = await api.post('/rides/create', body);
      if (res.data.success) {
        // Backend returns ride_id and the calculated distance_km (from OSRM)
        const postedDistance = Number(res.data.data.distance_km);
        setCreatedRideId(String(res.data.data.ride_id || null));
        setActualDistance(Number.isFinite(postedDistance) ? postedDistance : null);
        if (Number.isFinite(postedDistance)) {
          setDistanceKm(postedDistance);
        }
        setSuccessModalVisible(true);
      }
    } catch (error: any) {
      let msg = 'Something went wrong. Please try again.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      } else if (error.code) {
        msg = `Network Error: ${error.code}`;
      }
      showAlert({ type: 'error', title: 'Error', message: msg });
    } finally {
      setPublishing(false);
    }
  };

  const applyLocSelection = (label: string, coords?: { lat: number; lng: number }) => {
    if (locPickerTarget === 'origin') {
      setOrigin(label);
      setOriginCoords(coords ?? null);
    } else {
      setDestination(label);
      setDestCoords(coords ?? null);
    }
    setLocPickerTarget(null);
    setLocQuery('');
  };

  if (loading) {
    return <PostRideSkeleton />;
  }

  // FIX: Add error state UI with retry button
  if (loadError) {
    return (
      <View style={[s.safeArea, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent />
        <MaterialIcons name="wifi-off" size={64} color="#ddd" />
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16, textAlign: 'center' }}>
          Connection Error
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' }}>
          {loadError}
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row', alignItems: 'center', backgroundColor: '#C24E00',
            paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24,
          }}
          onPress={() => { setLoading(true); loadProfile(); }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="refresh" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFemale = profile?.gender === 'female';
  const maxSeats = vehicleType === 'bike' ? 1 : 6;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent />

      <RideStatusModal
        visible={successModalVisible}
        type="success"
        iconName="shield-check"
        title="Success! Ride Posted"
        message={`Your ride to ${destination} has been broadcasted. You'll be notified when a verified student books a seat.`}
        pillText="LPU NETWORK SECURED"
        rideDetails={{
          origin,
          destination,
          timeString: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase(),
          vehicleTypes: `${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} • ${seats} Seats • ${formatDistanceKm(actualDistance ?? distanceKm)}`,
        }}
        primaryAction={{
          label: 'Got it',
          icon: 'arrow-forward',
          onPress: () => {
            setSuccessModalVisible(false);
            router.replace('/(tabs)/explore');
          }
        }}
        secondaryAction={{
          label: 'View Ride Details',
          onPress: () => {
            setSuccessModalVisible(false);
            if (createdRideId) {
              router.replace({ pathname: '/(tabs)/ride-details', params: { rideId: createdRideId } });
            } else {
              router.replace('/(tabs)/explore');
            }
          }
        }}
      />

      <LocationPickerModal
        locPickerTarget={locPickerTarget}
        setLocPickerTarget={setLocPickerTarget}
        locQuery={locQuery}
        setLocQuery={setLocQuery}
        applyLocSelection={applyLocSelection}
      />

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={departureDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          maximumDate={maxDate}
          onChange={(e: DateTimePickerEvent, date?: Date) => {
            setShowDatePicker(false);
            if (e.type === 'set' && date) setDepartureDate(date);
          }}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={departureTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e: DateTimePickerEvent, time?: Date) => {
            setShowTimePicker(false);
            if (e.type === 'set' && time) setDepartureTime(time);
          }}
        />
      )}

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Post a Ride</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.scrollView}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <RouteSection
            origin={origin}
            destination={destination}
            distanceKm={distanceKm}
            departureDate={departureDate}
            departureTime={departureTime}
            isEmergencyRoute={isEmergencyRoute}
            setLocPickerTarget={setLocPickerTarget}
            setLocQuery={setLocQuery}
            setShowDatePicker={setShowDatePicker}
            setShowTimePicker={setShowTimePicker}
            setIsEmergencyRoute={setIsEmergencyRoute}
          />

          <VehicleSection
            vehicleType={vehicleType}
            setVehicleType={setVehicleType}
            seats={seats}
            setSeats={setSeats}
            maxSeats={maxSeats}
            mileage={mileage}
            setMileage={setMileage}
            fuelType={fuelType}
            setFuelType={setFuelType}
          />

          <PricingSection
            distanceKm={distanceKm}
            vehicleType={vehicleType}
            driverPrice={driverPrice}
            setDriverPrice={setDriverPrice}
            basePrice={basePrice}
            basePerSeat={basePerSeat}
            recommendedPerSeat={recommendedPerSeat}
            maxPerSeat={maxPerSeat}
            seats={seats}
            totalEarnings={totalEarnings}
            instantBooking={instantBooking}
            setInstantBooking={setInstantBooking}
            instantAck={instantAck}
            setInstantAck={setInstantAck}
            isFemale={isFemale}
            womenOnly={womenOnly}
            setWomenOnly={setWomenOnly}
          />

          {/* Publish Button - flows with content */}
          <View style={[s.publishBarWrap, { marginBottom: tabBarHeight }]}>
            <TouchableOpacity
              style={[s.publishBtn, !canPublish() && s.publishBtnDisabled]}
              onPress={handlePublish}
              activeOpacity={0.87}
              disabled={publishing || !canPublish()}
            >
              {publishing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="publish" size={20} color="#fff" />
                  <Text style={s.publishBtnText}>Publish Ride</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
