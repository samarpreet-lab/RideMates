// =============================================================================
// components/RideDetails/RideBadges.tsx — Feature Badges
// =============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ds } from './styles';
import { Ride } from '../Explore/constants';

interface Props {
    ride: Ride;
}

export default function RideBadges({ ride }: Props) {
    return (
        <View style={ds.badgeRow}>
            {/* Seats */}
            <View style={[ds.badge, ds.seatBadge]}>
                <MaterialIcons name="event-seat" size={14} color="#1976d2" />
                <Text style={[ds.badgeText, ds.seatText]}>
                    {ride.available_seats} seat{ride.available_seats > 1 ? 's' : ''} left
                </Text>
            </View>

            {/* Emergency Route */}
            {ride.is_emergency_route && (
                <View style={[ds.badge, ds.emergencyBadge]}>
                    <MaterialIcons name="warning" size={14} color="#f59e0b" />
                    <Text style={[ds.badgeText, ds.emergencyText]}>Alternate Route</Text>
                </View>
            )}

            {/* Women Only */}
            {ride.is_women_only && (
                <View style={[ds.badge, ds.womenBadge]}>
                    <MaterialIcons name="female" size={14} color="#db2777" />
                    <Text style={[ds.badgeText, ds.womenText]}>Women Only</Text>
                </View>
            )}

            {/* Instant Booking */}
            {ride.instant_booking && (
                <View style={[ds.badge, ds.instantBadge]}>
                    <MaterialIcons name="bolt" size={14} color="#059669" />
                    <Text style={[ds.badgeText, ds.instantText]}>Instant Book</Text>
                </View>
            )}

            {/* Fuel type */}
            <View style={[ds.badge, ds.fuelBadge]}>
                <MaterialIcons name="local-gas-station" size={14} color="#888" />
                <Text style={[ds.badgeText, ds.fuelText]}>{ride.fuel_type}</Text>
            </View>
        </View>
    );
}
