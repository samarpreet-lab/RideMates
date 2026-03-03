// =============================================================================
// components/MyRides/MyRideCard.tsx — Reusable component for booked/published
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { s } from './styles';
import { s as eStyles } from '../Explore/styles'; // Borrow internal route styles
import { formatDepartureTime } from '../Explore/constants';

interface MyRideCardProps {
    ride: any;
    viewMode: 'passenger' | 'driver';
}

export default function MyRideCard({ ride, viewMode }: MyRideCardProps) {
    const router = useRouter();

    // Determine status color and text 
    // For passengers, we look at the booking status. For drivers, the ride status.
    const status = viewMode === 'passenger' ? ride.booking_status : ride.status;

    let statusColor = '#666';
    let statusBg = '#f5f5f5';

    if (status === 'active' || status === 'confirmed') {
        statusColor = '#10b981'; // Green
        statusBg = '#d1fae5';
    } else if (status === 'completed') {
        statusColor = '#3b82f6'; // Blue
        statusBg = '#dbeafe';
    } else if (status === 'cancelled') {
        statusColor = '#ef4444'; // Red
        statusBg = '#fee2e2';
    }

    const handlePress = () => {
        router.push({
            pathname: '/(tabs)/ride-details',
            params: { rideId: String(ride.id) },
        });
    };

    return (
        <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={handlePress}>
            {/* Top Status Row */}
            <View style={s.statusBadgeWrap}>
                <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[s.statusText, { color: statusColor }]}>{status}</Text>
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
        </TouchableOpacity>
    );
}
