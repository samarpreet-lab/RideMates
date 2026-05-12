import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { s } from './styles';
import {
  Ride,
  getInitials,
  getTrustColor,
  getVehicleIcon,
  formatDepartureTime,
  formatDistanceKm,
} from './constants';

interface RideCardProps {
  ride: Ride;
  onDismissModal?: () => void;
}

export default function RideCard({ ride, onDismissModal }: RideCardProps) {
  const trustColor = getTrustColor(ride.driver_trust_score);
  const router = useRouter();

  const handlePress = () => {
    if (onDismissModal) {
      // Close the modal first, then navigate after the slide-out animation
      onDismissModal();
      setTimeout(() => {
        router.push({
          pathname: '/(tabs)/ride-details',
          params: { rideId: String(ride.id) },
        });
      }, 350);
    } else {
      router.push({
        pathname: '/(tabs)/ride-details',
        params: { rideId: String(ride.id) },
      });
    }
  };

  return (
    <TouchableOpacity style={s.rideCard} activeOpacity={0.85} onPress={handlePress}>
      <View style={s.rideCardTop}>
        <View style={s.rideDriverInfo}>
          <View style={[s.rideDriverAvatar, { borderColor: trustColor }]}>
            <Text style={s.rideDriverInitials}>
              {getInitials(ride.driver_name)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.rideDriverName} numberOfLines={1}>{ride.driver_name}</Text>
            <View style={s.rideDriverMeta}><MaterialIcons name="verified-user" size={12} color={trustColor} /><Text style={[s.rideTrustText, { color: trustColor }]}>{ride.driver_trust_score}</Text><View style={s.rideMetaDot} /><MaterialIcons name={getVehicleIcon(ride.vehicle_type) as any} size={13} color="#888" /><Text style={s.rideVehicleText}>{ride.vehicle_type}</Text></View>
          </View>
        </View>
        <View style={s.ridePriceBox}>
          <Text style={s.ridePriceLabel}>₹{ride.capped_price}</Text>
          <Text style={s.ridePriceSub}>per seat</Text>
        </View>
      </View>

      <View style={s.rideRouteRow}>
        <View style={s.rideRouteTimeline}><View style={s.rideOriginDot} /><View style={s.rideRouteLine} /><View style={s.rideDestDot} /></View>
        <View style={s.rideRouteDetails}>
          <Text style={s.rideRouteCity} numberOfLines={1}>{ride.origin_city}</Text>
          <Text style={s.rideRouteDist}>{formatDistanceKm(ride.distance_km)}</Text>
          <Text style={s.rideRouteCity} numberOfLines={1}>{ride.destination_city}</Text>
        </View>
        <View style={s.rideTimeBox}>
          <MaterialIcons name="schedule" size={14} color="#C24E00" />
          <Text style={s.rideTimeText}>{formatDepartureTime(ride.departure_time)}</Text>
        </View>
      </View>

      <View style={s.rideBadgeRow}><View style={s.rideSeatBadge}><MaterialIcons name="event-seat" size={12} color="#1976d2" /><Text style={s.rideSeatText}>{ride.available_seats} seat{ride.available_seats > 1 ? 's' : ''} left</Text></View>{ride.is_emergency_route ? <View style={s.rideEmergencyBadge}><MaterialIcons name="warning" size={12} color="#f59e0b" /><Text style={s.rideEmergencyText}>Alt Route</Text></View> : null}<View style={s.rideFuelBadge}><MaterialIcons name="local-gas-station" size={12} color="#888" /><Text style={s.rideFuelText}>{ride.fuel_type}</Text></View></View>
    </TouchableOpacity>
  );
}
