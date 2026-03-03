// =============================================================================
// app/(tabs)/ride-details.tsx — Ride Details & Booking Screen
// =============================================================================
// SRS: FR-RIDE-05, UC-03, BookingSuccess Component (Section 9.3)
//
// Flow:
//   1. Receives rideId from search params
//   2. Fetches fresh ride data via GET /api/rides/:id (prevents ghost seats)
//   3. Shows ride details with seat selector
//   4. On booking → POST /api/bookings/new (concurrency-safe)
//   5. On success → shows BookingSuccessSheet with WhatsApp/Call handoff
// =============================================================================

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { Ride } from '../../components/Explore/constants';
import { ds } from '../../components/RideDetails/styles';
import DriverInfoCard from '../../components/RideDetails/DriverInfoCard';
import RouteTimeline from '../../components/RideDetails/RouteTimeline';
import PriceBreakdown from '../../components/RideDetails/PriceBreakdown';
import RideBadges from '../../components/RideDetails/RideBadges';
import SeatSelector from '../../components/RideDetails/SeatSelector';
import BookingSuccessSheet from '../../components/RideDetails/BookingSuccessSheet';
import EditRideModal from '../../components/RideDetails/EditRideModal';

type ScreenState = 'loading' | 'detail' | 'error' | 'success';

interface BookingData {
    booking_id: number;
    ride_id: number;
    seats_booked: number;
    price_paid: number;
    remaining_seats: number;
}

export default function RideDetailsScreen() {
    const { rideId } = useLocalSearchParams<{ rideId: string }>();
    const router = useRouter();

    const [state, setState] = useState<ScreenState>('loading');
    const [ride, setRide] = useState<Ride | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [seatsSelected, setSeatsSelected] = useState(1);
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // ─── Fetch fresh ride data & profile on mount ────────────────────────────
    const fetchRide = async () => {
        setState('loading');
        setErrorMsg('');
        try {
            const [res, profileRes] = await Promise.all([
                api.get(`/rides/${rideId}`),
                api.get('/auth/profile').catch(() => ({ data: { success: false, data: null } }))
            ]);

            if (res.data.success) {
                setRide(res.data.data);
                if (profileRes.data.success) {
                    setProfile(profileRes.data.data);
                }
                setState('detail');
            } else {
                setErrorMsg(res.data.message || 'Failed to load ride details.');
                setState('error');
            }
        } catch (err: any) {
            const msg =
                err.response?.data?.message || 'Something went wrong. Please try again.';
            setErrorMsg(msg);
            setState('error');
        }
    };

    useEffect(() => {
        if (rideId) fetchRide();
    }, [rideId]);

    // ─── Handle booking ────────────────────────────────────────────────────
    const handleBook = async () => {
        if (!ride || isBooking) return;
        setIsBooking(true);

        try {
            const res = await api.post('/bookings/new', {
                ride_id: ride.id,
                seats_booked: seatsSelected,
            });

            if (res.data.success) {
                setBooking(res.data.data);
                setState('success');
            } else {
                Alert.alert('Booking Failed', res.data.message || 'Could not book the ride.');
            }
        } catch (err: any) {
            const msg =
                err.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Booking Failed', msg);
        } finally {
            setIsBooking(false);
        }
    };

    // ─── Handle Driver Ride Edits ──────────────────────────────────────────
    const handleCancelRide = () => {
        Alert.alert('Cancel Ride', 'Are you sure you want to cancel this published ride? This cannot be undone.', [
            { text: 'No, Keep It', style: 'cancel' },
            {
                text: 'Yes, Cancel',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const res = await api.delete(`/rides/${ride?.id}`);
                        if (res.data.success) {
                            Alert.alert('Ride Cancelled', 'Your ride has been successfully cancelled.');
                            router.replace('/(tabs)/my-rides');
                        } else {
                            Alert.alert('Error', res.data.message || 'Could not cancel ride.');
                        }
                    } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to cancel ride.');
                    }
                }
            }
        ]);
    };

    const handleEditSave = async (updates: Partial<Ride>) => {
        try {
            const res = await api.put(`/rides/${ride?.id}`, updates);
            if (res.data.success) {
                Alert.alert('Success', 'Ride updated successfully!');
                await fetchRide(); // Refresh data
                return true;
            } else {
                Alert.alert('Error', res.data.message || 'Could not update ride.');
                return false;
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update ride.');
            return false;
        }
    };

    // ─── Go back to home ──────────────────────────────────────────────────
    const handleDone = () => {
        router.replace('/(tabs)/explore');
    };

    // ─── Loading state ────────────────────────────────────────────────────
    if (state === 'loading') {
        return (
            <View style={ds.root}>
                <View style={ds.centerContainer}>
                    <ActivityIndicator size="large" color="#F37021" />
                    <Text style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
                        Loading ride details…
                    </Text>
                </View>
            </View>
        );
    }

    // ─── Error state ──────────────────────────────────────────────────────
    if (state === 'error') {
        return (
            <View style={ds.root}>
                <View style={ds.header}>
                    <TouchableOpacity style={ds.backBtn} onPress={() => router.push('/(tabs)/explore')}>
                        <MaterialIcons name="arrow-back" size={22} color="#1a1a1a" />
                    </TouchableOpacity>
                    <Text style={ds.headerTitle}>Ride Details</Text>
                </View>
                <View style={ds.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#e0e0e0" />
                    <Text style={ds.errorTitle}>Ride Unavailable</Text>
                    <Text style={ds.errorSub}>{errorMsg}</Text>
                    <TouchableOpacity style={ds.retryBtn} onPress={fetchRide}>
                        <MaterialIcons name="refresh" size={16} color="#F37021" />
                        <Text style={ds.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ─── Booking success state ────────────────────────────────────────────
    if (state === 'success' && ride && booking) {
        return <BookingSuccessSheet ride={ride} booking={booking} onDone={handleDone} />;
    }

    // ─── Main ride detail view ────────────────────────────────────────────
    if (!ride) return null;

    const perSeatPrice = Math.round(
        (parseFloat(String(ride.capped_price)) / Math.max(ride.available_seats, 1)) * 100
    ) / 100;
    const totalPrice = Math.round(perSeatPrice * seatsSelected * 100) / 100;
    const canBook = ride.status === 'active' && ride.available_seats > 0;
    const isDriver = profile?.id === ride.driver_id;

    return (
        <View style={ds.root}>
            {/* Header */}
            <View style={ds.header}>
                <TouchableOpacity style={ds.backBtn} onPress={() => router.push('/(tabs)/explore')}>
                    <MaterialIcons name="arrow-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={ds.headerTitle}>
                        {ride.origin_city} → {ride.destination_city}
                    </Text>
                    <Text style={ds.headerSubtitle}>Ride Details</Text>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={ds.scrollContent}>
                <DriverInfoCard ride={ride} />
                <RouteTimeline ride={ride} />
                <RideBadges ride={ride} />
                <PriceBreakdown ride={ride} seatsSelected={seatsSelected} />
                {canBook && !isDriver && (
                    <SeatSelector
                        seats={seatsSelected}
                        maxSeats={ride.available_seats}
                        onChange={setSeatsSelected}
                    />
                )}
            </ScrollView>

            {/* Bottom Control Bar */}
            {isDriver ? (
                <View style={ds.bottomBar}>
                    {ride.status === 'active' ? (
                        <View style={ds.editBtnGroup}>
                            <TouchableOpacity style={ds.editBtn} onPress={() => setEditModalVisible(true)}>
                                <MaterialIcons name="edit" size={20} color="#444" />
                                <Text style={ds.editBtnText}>Edit Ride</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={ds.cancelRideBtn} onPress={handleCancelRide}>
                                <MaterialIcons name="cancel" size={20} color="#ef4444" />
                                <Text style={ds.cancelRideBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[ds.bookBtn, ds.bookBtnDisabled, { width: '100%', marginHorizontal: 0 }]}>
                            <MaterialIcons name="info-outline" size={20} color="#999" />
                            <Text style={[ds.bookBtnText, { color: '#999' }]}>
                                Ride is {ride.status}
                            </Text>
                        </View>
                    )}
                </View>
            ) : canBook ? (
                <View style={ds.bottomBar}>
                    <View style={ds.bottomBarRow}>
                        <View style={ds.bottomPriceCol}>
                            <Text style={ds.bottomPriceLabel}>
                                {seatsSelected} seat{seatsSelected > 1 ? 's' : ''}
                            </Text>
                            <Text style={ds.bottomPriceValue}>₹{totalPrice.toFixed(0)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[ds.bookBtn, isBooking && ds.bookBtnDisabled]}
                            onPress={handleBook}
                            activeOpacity={0.87}
                            disabled={isBooking}
                        >
                            {isBooking ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                                    <Text style={ds.bookBtnText}>Book Now</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={ds.bottomBar}>
                    <View
                        style={[
                            ds.bookBtn,
                            ds.bookBtnDisabled,
                            { flex: 1, marginHorizontal: 0 },
                        ]}
                    >
                        <MaterialIcons name="block" size={20} color="#999" />
                        <Text style={[ds.bookBtnText, { color: '#999' }]}>
                            {ride.available_seats <= 0 ? 'Fully Booked' : 'Ride Unavailable'}
                        </Text>
                    </View>
                </View>
            )}

            {/* Edit Modal for Drivers */}
            {isDriver && (
                <EditRideModal
                    visible={isEditModalVisible}
                    ride={ride}
                    onClose={() => setEditModalVisible(false)}
                    onSave={handleEditSave}
                />
            )}
        </View>
    );
}
