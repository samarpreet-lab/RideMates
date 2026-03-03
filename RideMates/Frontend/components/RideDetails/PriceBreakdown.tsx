// =============================================================================
// components/RideDetails/PriceBreakdown.tsx — Price Info Card
// =============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { ds } from './styles';
import { Ride } from '../Explore/constants';

interface Props {
    ride: Ride;
    seatsSelected: number;
}

export default function PriceBreakdown({ ride, seatsSelected }: Props) {
    const perSeatPrice = Math.round(
        (parseFloat(String(ride.capped_price)) / Math.max(ride.available_seats, 1)) * 100
    ) / 100;
    const totalForSeats = Math.round(perSeatPrice * seatsSelected * 100) / 100;

    return (
        <View style={ds.card}>
            {/* Base fuel cost */}
            <View style={ds.priceRow}>
                <Text style={ds.priceLabel}>Base fuel cost</Text>
                <Text style={ds.priceValue}>₹{Number(ride.base_price).toFixed(0)}</Text>
            </View>

            {/* Capped price */}
            <View style={ds.priceRow}>
                <Text style={ds.priceLabel}>Ride price (capped)</Text>
                <Text style={ds.priceValue}>₹{Number(ride.capped_price).toFixed(0)}</Text>
            </View>

            {/* Per seat */}
            <View style={ds.priceRow}>
                <Text style={ds.priceLabel}>Per seat</Text>
                <Text style={ds.priceValue}>₹{perSeatPrice.toFixed(0)}</Text>
            </View>

            <View style={ds.priceDivider} />

            {/* Total for selected seats */}
            <View style={ds.priceTotalRow}>
                <Text style={ds.priceTotalLabel}>
                    You pay ({seatsSelected} seat{seatsSelected > 1 ? 's' : ''})
                </Text>
                <Text style={ds.priceTotalValue}>₹{totalForSeats.toFixed(0)}</Text>
            </View>
            <Text style={ds.pricePerSeatNote}>
                Cash payment to driver
            </Text>
        </View>
    );
}
