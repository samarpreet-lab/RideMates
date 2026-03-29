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
import RideStatusModal from '../../components/ui/RideStatusModal';
import EditRideModal from '../../components/RideDetails/EditRideModal';
import PassengerList from '../../components/RideDetails/PassengerList';
import { useAlert } from '../../components/ui/AlertContext';
import { RideDetailsSkeleton } from '../../components/ui/SkeletonLoader';

type ScreenState = 'loading' | 'detail' | 'error' | 'success';

interface BookingData {
    booking_id: number;
    ride_id: number;
    seats_booked: number;
    price_paid: number;
    remaining_seats: number;
}

export default function RideDetailsScreen() {
    const { rideId, from } = useLocalSearchParams<{ rideId: string; from?: string }>();
    const router = useRouter();
    const { showAlert } = useAlert();
    const goBack = () => router.push(from === 'my-rides' ? '/(tabs)/my-rides' : '/(tabs)/explore');

    const [state, setState] = useState<ScreenState>('loading');
    const [ride, setRide] = useState<Ride | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [seatsSelected, setSeatsSelected] = useState(1);
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [myBooking, setMyBooking] = useState<any>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [statusModal, setStatusModal] = useState<any>(null);

    // ─── Fetch fresh ride data & profile on mount ────────────────────────────
    const fetchRide = async () => {
        setState('loading');
        setErrorMsg('');
        // reset any previous booking result (important when revisiting same ride)
        setBooking(null);
        try {
            const [res, profileRes] = await Promise.all([
                api.get(`/rides/${rideId}`),
                api.get('/auth/profile').catch(() => ({ data: { success: false, data: null } }))
            ]);

            if (res.data.success) {
                setRide(res.data.data);
                setMyBooking(res.data.data.my_booking || null);
                
                if (profileRes.data && profileRes.data.success) {
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
                setStatusModal({
                    visible: true,
                    type: 'success',
                    iconName: 'check-circle',
                    title: ride.instant_booking ? 'Seat Booked!' : 'Request Sent!',
                    message: ride.instant_booking 
                        ? `Your booking with ${ride.driver_name} is confirmed.` 
                        : `Your request has been sent to ${ride.driver_name}. You'll be notified once they accept.`,
                    pillText: 'BOOKING CONFIRMED',
                    primaryLabel: 'Done',
                    primaryIcon: 'home',
                    onPrimaryPress: handleDone,
                    showContact: ride.instant_booking,
                });
            } else {
                showAlert({ type: 'error', title: 'Booking Failed', message: res.data.message || 'Could not book the ride.' });
            }
        } catch (err: any) {
            const msg =
                err.response?.data?.message || 'Something went wrong. Please try again.';
            showAlert({ type: 'error', title: 'Booking Failed', message: msg });
        } finally {
            setIsBooking(false);
        }
    };

    // ─── Handle booking approval / rejection (driver only) ─────────────────
    const handleAcceptBooking = async (bookingId: number) => {
        try {
            const res = await api.put(`/bookings/${bookingId}/accept`);
            if (res.data.success) {
                showAlert({ type: 'success', title: 'Accepted', message: 'Booking confirmed for the passenger.' });
                await fetchRide();
            } else {
                showAlert({ type: 'error', title: 'Error', message: res.data.message || 'Could not accept booking.' });
            }
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to accept booking.' });
        }
    };

    const handleRejectBooking = (bookingId: number) => {
        setStatusModal({
            visible: true,
            type: 'warning',
            iconName: 'alert-circle',
            title: 'Reject Request',
            message: 'Are you sure you want to reject this booking request?',
            primaryLabel: 'Yes, Reject',
            primaryIcon: 'close',
            onPrimaryPress: async () => {
                setStatusModal(null);
                try {
                    const res = await api.put(`/bookings/${bookingId}/reject`);
                    if (res.data.success) {
                        showAlert({ type: 'success', title: 'Rejected', message: 'Booking request rejected.' });
                        await fetchRide();
                    } else {
                        showAlert({ type: 'error', title: 'Error', message: res.data.message || 'Could not reject booking.' });
                    }
                } catch (err: any) {
                    showAlert({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to reject booking.' });
                }
            },
            secondaryLabel: 'No',
            onSecondaryPress: () => setStatusModal(null),
        });
    };

    // ─── Handle Driver Ride Edits ──────────────────────────────────────────
    const handleCancelRide = () => {
        setStatusModal({
            visible: true,
            type: 'error',
            iconName: 'alert-circle',
            title: 'Cancel Ride',
            message: 'Are you sure you want to cancel this published ride? This cannot be undone.',
            pillText: 'WARNING',
            primaryLabel: 'Yes, Cancel',
            primaryIcon: 'delete',
            onPrimaryPress: async () => {
                setStatusModal(null);
                setTimeout(async () => {
                    try {
                        const res = await api.delete(`/rides/${ride?.id}`);
                        if (res.data.success) {
                            setStatusModal({
                                visible: true, type: 'success', iconName: 'cancel',
                                title: 'Ride Cancelled', message: 'Your ride has been successfully cancelled.',
                                pillText: 'CANCELLATION CONFIRMED',
                                primaryLabel: 'Go to My Rides',
                                primaryIcon: 'arrow-forward',
                                onPrimaryPress: () => router.replace('/(tabs)/my-rides'),
                            });
                        } else {
                            showAlert({ type: 'error', title: 'Error', message: res.data.message || 'Could not cancel ride.' });
                        }
                    } catch (err: any) {
                        showAlert({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to cancel ride.' });
                    }
                }, 300);
            },
            secondaryLabel: 'No, Keep It',
            onSecondaryPress: () => setStatusModal(null),
        });
    };

    const handleEditSave = async (updates: Partial<Ride>) => {
        try {
            const res = await api.put(`/rides/${ride?.id}`, updates);
            if (res.data.success) {
                setStatusModal({
                    visible: true, type: 'success', iconName: 'check-circle',
                    title: 'Changes Saved', message: 'Your ride has been updated successfully.',
                    pillText: 'RIDE UPDATED',
                    primaryLabel: 'Got it',
                    primaryIcon: 'check',
                    onPrimaryPress: () => { setStatusModal(null); setEditModalVisible(false); }
                });
                await fetchRide(); // Refresh data
                return true;
            } else {
                showAlert({ type: 'error', title: 'Error', message: res.data.message || 'Could not update ride.' });
                return false;
            }
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to update ride.' });
            return false;
        }
    };

    // ─── Go back to home ──────────────────────────────────────────────────
    const handleDone = () => {
        router.replace(from === 'my-rides' ? '/(tabs)/my-rides' : '/(tabs)/explore');
    };

    // ─── Loading state ────────────────────────────────────────────────────
    if (state === 'loading') {
        return <RideDetailsSkeleton />;
    }

    // ─── Error state ──────────────────────────────────────────────────────
    if (state === 'error') {
        return (
            <View style={ds.root}>
                <View style={ds.header}>
                    <TouchableOpacity style={ds.backBtn} onPress={goBack}>
                        <MaterialIcons name="arrow-back" size={22} color="#1a1a1a" />
                    </TouchableOpacity>
                    <Text style={ds.headerTitle}>Ride Details</Text>
                </View>
                <View style={ds.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#e0e0e0" />
                    <Text style={ds.errorTitle}>Ride Unavailable</Text>
                    <Text style={ds.errorSub}>{errorMsg}</Text>
                    <TouchableOpacity style={ds.retryBtn} onPress={fetchRide}>
                        <MaterialIcons name="refresh" size={16} color="#C24E00" />
                        <Text style={ds.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ─── Main ride detail view ────────────────────────────────────────────
    if (!ride) return null;

    // capped_price is ALREADY per-seat (stored that way in DB per SRS v1.5)
    const perSeatPrice = Math.round(parseFloat(String(ride.capped_price)) * 100) / 100;
    const totalPrice = Math.round(perSeatPrice * seatsSelected * 100) / 100;
    const hasMyBooking = myBooking && myBooking.booking_status !== 'cancelled';
    const canBook = ride.status === 'active' && ride.available_seats > 0 && !hasMyBooking;
    const isDriver = profile?.id === ride.driver_id;

    return (
        <View style={ds.root}>
            {/* Header */}
            <View style={ds.header}>
                <TouchableOpacity style={ds.backBtn} onPress={goBack}>
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

                {/* show my booking summary if I already booked */}
                {!isDriver && hasMyBooking && (
                    <View style={{ padding: 16, backgroundColor: '#FFF7E8', borderRadius: 12, marginVertical: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#C24E00' }}>
                            You have a {myBooking.booking_status} booking for {myBooking.seats_booked} seat{myBooking.seats_booked>1?'s':''}.
                        </Text>
                        {myBooking.booking_status === 'pending' && (
                            <TouchableOpacity
                                style={[ds.cancelRideBtn, { marginTop: 8 }]}
                                onPress={async () => {
                                    try {
                                        const res = await api.put(`/bookings/${myBooking.booking_id}/cancel`);
                                        if (res.data.success) {
                                            showAlert({type:'success', title:'Request withdrawn', message:res.data.message});
                                            await fetchRide();
                                        }
                                    } catch(e:any){showAlert({type:'error',title:'Error',message:e.response?.data?.message||'Could not withdraw.'});}
                                }}
                            >
                                <MaterialIcons name="cancel" size={18} color="#ef4444" />
                                <Text style={[ds.cancelRideBtnText,{marginLeft:6}]}>Withdraw Request</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {isDriver && ride.passengers && ride.passengers.length > 0 && (
                    <PassengerList
                        passengers={ride.passengers}
                        rideInfo={{ origin_city: ride.origin_city, destination_city: ride.destination_city }}
                        onAccept={handleAcceptBooking}
                        onReject={handleRejectBooking}
                    />
                )}

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
                        <View style={ds.bottomBarRow}>
                            <View style={[ds.bookBtn, ds.bookBtnDisabled, { flex: 1, marginHorizontal: 0 }]}>
                                <MaterialIcons name="info-outline" size={20} color="#999" />
                                <Text style={[ds.bookBtnText, { color: '#999' }]}>
                                    Ride is {ride.status}
                                </Text>
                            </View>
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
                    <View style={ds.bottomBarRow}>
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
                </View>
            )}

            {/* Edit Modal for Drivers */}
            {isDriver && (
                <EditRideModal
                    visible={isEditModalVisible}
                    ride={ride}
                    onClose={() => setEditModalVisible(false)}
                    onSave={handleEditSave}
                    onSaveSuccess={fetchRide}
                />
            )}

            {/* Ride Status Modal (Booking/Cancel/Edit details) */}
            <RideStatusModal
                visible={statusModal?.visible || false}
                type={statusModal?.type || 'success'}
                iconName={statusModal?.iconName || 'shield-check'}
                title={statusModal?.title || ''}
                message={statusModal?.message || ''}
                pillText={statusModal?.pillText}
                rideDetails={{
                    origin: ride.origin_city,
                    destination: ride.destination_city,
                    timeString: new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase(),
                    vehicleTypes: `${ride.vehicle_type.charAt(0).toUpperCase() + ride.vehicle_type.slice(1)} • ${seatsSelected} Seats`,
                }}
                primaryAction={{
                    label: statusModal?.primaryLabel || 'Done',
                    icon: statusModal?.primaryIcon,
                    onPress: statusModal?.onPrimaryPress || (() => setStatusModal(null))
                }}
                secondaryAction={statusModal?.secondaryLabel ? {
                    label: statusModal.secondaryLabel,
                    onPress: statusModal.onSecondaryPress || (() => setStatusModal(null))
                } : undefined}
                contactActions={statusModal?.showContact ? {
                    driverPhone: ride.driver_phone || undefined,
                    passengerName: profile?.full_name || undefined,
                    driverName: ride.driver_name || undefined,
                    origin: ride.origin_city,
                    destination: ride.destination_city,
                } : undefined}
            />
        </View>
    );
}
