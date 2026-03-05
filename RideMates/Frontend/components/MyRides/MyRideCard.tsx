// =============================================================================
// components/MyRides/MyRideCard.tsx — Reusable component for booked/published
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { s } from './styles';
import { s as eStyles } from '../Explore/styles'; // Borrow internal route styles
import { formatDepartureTime } from '../Explore/constants';

interface MyRideCardProps {
    ride: any;
    viewMode: 'passenger' | 'driver';
    onCancelBooking?: (bookingId: number) => void;
}

export default function MyRideCard({ ride, viewMode, onCancelBooking }: MyRideCardProps) {
    const router = useRouter();

    // Determine status color and text 
    // For passengers, we look at the booking status. For drivers, the ride status.
    let status = viewMode === 'passenger' ? ride.booking_status : ride.status;

    // If a driver's ride was auto-completed but had zero bookings,
    // show "Expired" instead of "completed" — nobody took the ride.
    if (viewMode === 'driver' && status === 'completed' && Number(ride.booking_count) === 0) {
        status = 'expired';
    }

    let statusColor = '#666';
    let statusBg = '#f5f5f5';
    let statusLabel = status;

    if (status === 'active' || status === 'confirmed') {
        statusColor = '#10b981'; // Green
        statusBg = '#d1fae5';
    } else if (status === 'completed') {
        statusColor = '#3b82f6'; // Blue
        statusBg = '#dbeafe';
    } else if (status === 'cancelled') {
        statusColor = '#ef4444'; // Red
        statusBg = '#fee2e2';
    } else if (status === 'expired') {
        statusColor = '#d97706'; // Amber
        statusBg = '#fef3c7';
        statusLabel = 'Ride Time Passed';
    }

    // Can the passenger cancel this booking?
    const canCancel = viewMode === 'passenger' && status === 'confirmed';

    const handlePress = () => {
        router.push({
            pathname: '/(tabs)/ride-details',
            params: { rideId: String(ride.id) },
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

        Alert.alert(
            'Cancel Booking?',
            `Are you sure you want to cancel your booking for ${ride.origin_city} → ${ride.destination_city}?\n\n${penaltyWarning}`,
            [
                { text: 'Keep Booking', style: 'cancel' },
                {
                    text: 'Cancel Booking',
                    style: 'destructive',
                    onPress: () => onCancelBooking?.(ride.booking_id),
                },
            ]
        );
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
                    <Text style={s.metaLabel}>{viewMode === 'passenger' ? 'Amount Paid' : 'Total Revenue (Est)'}</Text>
                    <Text style={[s.metaValue, { color: '#F37021' }]}>
                        ₹{viewMode === 'passenger' ? ride.price_paid : (ride.capped_price)}
                    </Text>
                </View>
            </View>

            {/* Cancel Booking Button (passenger confirmed only) */}
            {canCancel && (
                <TouchableOpacity
                    style={s.cancelBookingBtn}
                    activeOpacity={0.8}
                    onPress={handleCancelBooking}
                >
                    <MaterialIcons name="cancel" size={16} color="#ef4444" />
                    <Text style={s.cancelBookingBtnText}>Cancel Booking</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

