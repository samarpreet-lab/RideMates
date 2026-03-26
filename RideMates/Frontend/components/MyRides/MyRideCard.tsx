// =============================================================================
// components/MyRides/MyRideCard.tsx — Reusable component for booked/published
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useAlert } from '../ui/AlertContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { s } from './styles';
import { s as eStyles } from '../Explore/styles'; // Borrow internal route styles
import { formatDepartureTime } from '../Explore/constants';

interface MyRideCardProps {
    ride: any;
    viewMode: 'passenger' | 'driver';
    onCancelBooking?: (bookingId: number) => void;
    onPromptCancel?: (bookingId: number, penaltyWarning: string, ride: any) => void;
}

export default function MyRideCard({ ride, viewMode, onCancelBooking, onPromptCancel }: MyRideCardProps) {
    const router = useRouter();
    const { showAlert } = useAlert();

    // Determine status color and text 
    // For passengers, we look at the booking status. For drivers, the ride status.
    let status = viewMode === 'passenger' ? ride.booking_status : ride.status;

    // If a driver's ride was auto-completed but had zero bookings,
    // show "Expired" instead of "completed" — nobody took the ride.
    if (viewMode === 'driver' && status === 'completed' && Number(ride.booking_count) === 0) {
        status = 'expired';
    }

    let statusColor = '#6B5344';
    let statusBg = '#F5F0EB';
    let statusLabel = status;

    if (status === 'active' || status === 'confirmed') {
        statusColor = '#3DAA6E'; // Success
        statusBg = '#F2FAF5';
    } else if (status === 'completed') {
        statusColor = '#1976d2'; // Info (completed)
        statusBg = '#e3f2fd';
    } else if (status === 'cancelled') {
        statusColor = '#D9622A'; // Error
        statusBg = '#FFF6F5';
    } else if (status === 'expired') {
        statusColor = '#D4960F'; // Warning
        statusBg = '#FEFDF2';
        statusLabel = 'Ride Time Passed';
    }

    // Can the passenger cancel this booking?
    const canCancel = viewMode === 'passenger' && status === 'confirmed';

    // WhatsApp handoff — builds the wa.me deep-link and opens WhatsApp
    const openWhatsApp = (phone: string, message: string) => {
        const cleaned = phone.replace(/\D/g, '');
        const finalPhone = cleaned.length === 10 ? `91${cleaned}` : cleaned;
        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        Linking.canOpenURL(url)
            .then(can => { if (can) Linking.openURL(url).catch(() => {}); })
            .catch(() => {});
    };

    // Passenger → Driver: post-booking coordination ("where is pickup?")
    const handleContactDriver = () => {
        if (!ride.driver_phone) return;
        const msg =
            `Hi ${ride.driver_name || 'Driver'}! I have a confirmed booking for your RideMates ride ` +
            `from *${ride.origin_city}* to *${ride.destination_city}*. ` +
            `Where exactly should we meet for pickup?`;
        openWhatsApp(ride.driver_phone, msg);
    };

    const handlePress = () => {
        router.push({
            pathname: '/(tabs)/ride-details',
            params: { rideId: String(ride.id), from: 'my-rides' },
        });
    };

    const handleCancelBooking = () => {
        // Calculate time until departure for the penalty warning
        const now = new Date();
        const departure = new Date(ride.departure_time);
        const hoursLeft = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

        let penaltyWarning: string;
        if (hoursLeft > 4) {
            penaltyWarning = 'No penalty — free cancellation (more than 4 hours until departure).';
        } else if (hoursLeft > 0.5) {
            penaltyWarning = '⚠️ Late cancellation — you will lose 2 Trust Points.';
        } else {
            penaltyWarning = '⚠️ Last-minute cancellation — you will lose 5 Trust Points (same as a no-show).';
        }

        if (onPromptCancel) {
            onPromptCancel(ride.booking_id, penaltyWarning, ride);
        } else {
            showAlert({
                type: 'confirm',
                title: 'Cancel Booking?',
                message: `Are you sure you want to cancel your booking for ${ride.origin_city} → ${ride.destination_city}?\n\n${penaltyWarning}`,
                confirmText: 'Cancel Booking',
                cancelText: 'Keep Booking',
                onConfirm: () => {
                    onCancelBooking?.(ride.booking_id);
                    if (ride.driver_phone) {
                        const msg =
                            `Hi ${ride.driver_name || 'Driver'}! Sorry, I just had to cancel my booking ` +
                            `for your *${ride.origin_city}* → *${ride.destination_city}* ride on RideMates. ` +
                            `You can open up that seat for someone else. 🙏`;
                        openWhatsApp(ride.driver_phone, msg);
                    }
                },
            });
        }
    };

    return (
        <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={handlePress}>
            {/* Top Status Row */}
            <View style={s.statusBadgeWrap}>
                <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>
                    {formatDepartureTime(ride.departure_time)}
                </Text>
            </View>

            {/* Booked Banner — shown on driver's published rides that have bookings */}
            {viewMode === 'driver' && Number(ride.booking_count) > 0 && (
                <View style={s.bookedBanner}>
                    <MaterialIcons name="people" size={16} color="#3DAA6E" />
                    <Text style={s.bookedBannerText}>
                        🎉 {ride.booking_count} Booked{Number(ride.booking_count) !== 1 ? 's' : ''}
                    </Text>
                </View>
            )}

            {/* Driver Info or Passenger overview */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialIcons name="person" size={16} color="#aaa" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
                    {viewMode === 'passenger' ? `Driver: ${ride.driver_name}` : `Your Route`}
                </Text>
            </View>

            {/* Route Row (Reused from Explore styles) */}
            <View style={[eStyles.rideRouteRow, { marginBottom: 0 }]}>
                <View style={eStyles.rideRouteTimeline}>
                    <View style={eStyles.rideOriginDot} />
                    <View style={eStyles.rideRouteLine} />
                    <View style={eStyles.rideDestDot} />
                </View>
                <View style={eStyles.rideRouteDetails}>
                    <Text style={eStyles.rideRouteCity} numberOfLines={1}>{ride.origin_city}</Text>
                    <Text style={eStyles.rideRouteDist}>{ride.distance_km} km</Text>
                    <Text style={eStyles.rideRouteCity} numberOfLines={1}>{ride.destination_city}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </View>

            {/* Bottom Meta Row (Seats & Price) */}
            <View style={s.metaRow}>
                <View>
                    <Text style={s.metaLabel}>{viewMode === 'passenger' ? 'Seats Booked' : 'Available Seats'}</Text>
                    <Text style={s.metaValue}>
                        {viewMode === 'passenger' ? ride.seats_booked : ride.available_seats}
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.metaLabel}>{viewMode === 'passenger' ? 'Amount Paid' : 'Price per Seat'}</Text>
                    <Text style={[s.metaValue, { color: '#C24E00' }]}>
                        ₹{viewMode === 'passenger' ? ride.price_paid : ride.capped_price}
                    </Text>
                </View>
            </View>

            {/* Action row: WhatsApp contact + Cancel (passenger confirmed only) */}
            {canCancel && (
                <View style={s.actionBtnRow}>
                    {!!ride.driver_phone && (
                        <TouchableOpacity
                            style={[s.actionBtn, s.whatsappActionBtn]}
                            activeOpacity={0.8}
                            onPress={handleContactDriver}
                        >
                            <MaterialIcons name="chat" size={15} color="#C24E00" />
                            <Text style={s.whatsappActionBtnText}>WhatsApp</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[s.actionBtn, s.cancelActionBtn]}
                        activeOpacity={0.8}
                        onPress={handleCancelBooking}
                    >
                        <MaterialIcons name="cancel" size={15} color="#D9622A" />
                        <Text style={s.cancelActionBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
}

