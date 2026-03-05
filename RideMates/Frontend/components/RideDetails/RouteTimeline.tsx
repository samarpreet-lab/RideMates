// =============================================================================
// components/RideDetails/RouteTimeline.tsx — Route Origin → Destination
// =============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ds } from './styles';
import { Ride, formatDepartureTime } from '../Explore/constants';

interface Props {
    ride: Ride;
}

export default function RouteTimeline({ ride }: Props) {
    return (
        <View style={ds.routeCard}>
            <View style={ds.routeRow}>
                {/* Timeline dots + line */}
                <View style={ds.routeTimeline}>
                    <View style={ds.originDot} />
                    <View style={ds.routeLine} />
                    <View style={ds.destDot} />
                </View>

                {/* Route details */}
                <View style={ds.routeDetails}>
                    <Text style={ds.routeLabel}>PICKUP</Text>
                    <Text style={ds.routeCity}>{ride.origin_city}</Text>

                    <View style={ds.routeDivider}>
                        <MaterialIcons name="straighten" size={14} color="#bbb" />
                        <Text style={ds.routeDistText}>{ride.distance_km} km</Text>
                        <View style={ds.driverMetaDot} />
                        <MaterialIcons name="local-gas-station" size={14} color="#bbb" />
                        <Text style={ds.routeDistText}>{ride.fuel_type}</Text>
                    </View>

                    <Text style={ds.routeDestLabel}>DROP-OFF</Text>
                    <Text style={ds.routeCity}>{ride.destination_city}</Text>
                </View>
            </View>

            {/* Departure time */}
            <View style={ds.departureRow}>
                <MaterialIcons name="schedule" size={18} color="#C24E00" />
                <Text style={ds.departureText}>
                    {formatDepartureTime(ride.departure_time)}
                </Text>
            </View>
        </View>
    );
}
