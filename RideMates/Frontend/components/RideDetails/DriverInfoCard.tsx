// =============================================================================
// components/RideDetails/DriverInfoCard.tsx — Driver Profile Card
// =============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ds } from './styles';
import {
    Ride,
    getInitials,
    getTrustColor,
    getVehicleIcon,
} from '../Explore/constants';

interface Props {
    ride: Ride;
}

export default function DriverInfoCard({ ride }: Props) {
    const trustColor = getTrustColor(ride.driver_trust_score);

    return (
        <View style={ds.card}>
            <View style={ds.driverRow}>
                {/* Avatar */}
                <View style={[ds.driverAvatar, { borderColor: trustColor }]}>
                    <Text style={ds.driverInitials}>{getInitials(ride.driver_name)}</Text>
                </View>

                {/* Name + Meta */}
                <View style={ds.driverInfo}>
                    <Text style={ds.driverName} numberOfLines={1}>
                        {ride.driver_name}
                    </Text>
                    <View style={ds.driverMeta}>
                        <MaterialIcons name="verified-user" size={13} color={trustColor} />
                        <Text style={[ds.driverTrustText, { color: trustColor }]}>
                            {ride.driver_trust_score}
                        </Text>
                        <View style={ds.driverMetaDot} />
                        <MaterialIcons
                            name={getVehicleIcon(ride.vehicle_type) as any}
                            size={14}
                            color="#888"
                        />
                        <Text style={ds.driverVehicleText}>{ride.vehicle_type}</Text>
                    </View>
                    <Text style={ds.driverEmail} numberOfLines={1}>
                        {ride.driver_email}
                    </Text>
                </View>
            </View>
        </View>
    );
}
