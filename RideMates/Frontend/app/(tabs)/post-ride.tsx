// =============================================================================
// post-ride.tsx — Post a Ride Screen (Wizard Layout)
// =============================================================================
// Transformed into manageable components: RouteSection, VehicleSection, PricingSection
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Local dependencies
import api, { deleteToken } from '../../services/api';
import { VEHICLE_TYPES, FUEL_RATES, VEHICLE_MULTIPLIERS, HUB_COORDS } from '../../components/PostRide/constants';
import { s } from '../../components/PostRide/styles';

// Sub-components
import RouteSection from '../../components/PostRide/RouteSection';
import VehicleSection from '../../components/PostRide/VehicleSection';
import PricingSection from '../../components/PostRide/PricingSection';
import LocationPickerModal from '../../components/PostRide/LocationPickerModal';
import { useAlert } from '../../components/ui/AlertContext';

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
  return Math.round(n * 100) / 100;
}

export default function PostRideScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

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

  // --- Load user profile ---
  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        await deleteToken();
        router.replace('/(tabs)/login');
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
    if (!origin || !destination) { setDistanceKm(0); return; }
    const o = getCoords(origin);
    const d = getCoords(destination);
    if (o && d) {
      const km = haversineKm(o.lat, o.lng, d.lat, d.lng);
      setDistanceKm(km);
    } else {
      setDistanceKm(0);
    }
  }, [origin, destination]);

  // --- Update mileage default on vehicle type change ---
  useEffect(() => {
    const vt = VEHICLE_TYPES.find((v) => v.id === vehicleType);
    if (vt) setMileage(String(vt.defaultMileage));
    // Reset seats for bike
    if (vehicleType === 'bike' && seats > 1) setSeats(1);
  }, [vehicleType]);

  // --- Price calculations ---
  const fuelRate = FUEL_RATES[fuelType] || 105;
  const mileageNum = parseFloat(mileage) || 15;
  const basePrice = distanceKm > 0 ? round2((distanceKm * fuelRate) / mileageNum) : 0;
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.5;
  const maxAllowed = round2(basePrice * multiplier);
  const cappedPrice = Math.min(driverPrice, maxAllowed);
  const perSeat = seats > 0 ? round2(cappedPrice / seats) : 0;

  // Init slider to max when distance changes
  useEffect(() => {
    if (maxAllowed > 0) setDriverPrice(maxAllowed);
  }, [maxAllowed]);

  // --- Validation ---
  const canPublish = (): boolean => {
    if (!origin.trim() || !destination.trim()) return false;
    if (origin === destination) return false;
    if (distanceKm <= 0) return false;
    if (driverPrice <= 0) return false;
    if (instantBooking && !instantAck) return false;
    return true;
  };

  // --- Combine date + time and convert to UTC for MySQL DATETIME format ---
  const getDepartureUTC = (): string => {
    const d = new Date(departureDate);
    d.setHours(departureTime.getHours(), departureTime.getMinutes(), 0, 0);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  // --- Publish ---
  const handlePublish = async () => {
    if (!canPublish()) return;
    const oCoords = getCoords(origin);
    const dCoords = getCoords(destination);

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
        showAlert({
          type: 'success',
          title: 'Ride Published!',
          message: `Your ride from ${origin} to ${destination} is now live.\n\nPrice: ₹${res.data.data.capped_price}` +
            (res.data.data.was_clamped ? ' (capped by system)' : ''),
          confirmText: 'Great!',
          onDismiss: () => router.replace('/(tabs)/explore'),
        });
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

  const applyLocSelection = (label: string) => {
    if (locPickerTarget === 'origin') setOrigin(label);
    else setDestination(label);
    setLocPickerTarget(null);
    setLocQuery('');
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#F37021" />
        <Text style={s.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isFemale = profile?.gender === 'female';
  const maxSeats = vehicleType === 'bike' ? 1 : 6;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
        <TouchableOpacity onPress={() => router.replace('/(tabs)/explore')} style={s.headerBackBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Post a Ride</Text>
        <View style={{ width: 36 }} />
      </View>

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
          maxAllowed={maxAllowed}
          seats={seats}
          perSeat={perSeat}
          instantBooking={instantBooking}
          setInstantBooking={setInstantBooking}
          instantAck={instantAck}
          setInstantAck={setInstantAck}
          isFemale={isFemale}
          womenOnly={womenOnly}
          setWomenOnly={setWomenOnly}
        />

        {/* Spacer for button */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Publish Button */}
      <View style={s.publishBarWrap}>
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
    </SafeAreaView>
  );
}
