// =============================================================================
// components/RideDetails/BookingSuccessSheet.tsx — Post-Booking Confirmation
// =============================================================================
// SRS: BookingSuccess Component (Section 9.3)
//   - Confirmation message, booking summary
//   - WhatsApp button (wa.me) and Call button (tel:)
//   - Fallback when driver has no phone
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ds } from './styles';
import { Ride, formatDepartureTime } from '../Explore/constants';

interface BookingData {
    booking_id: number;
    ride_id: number;
    seats_booked: number;
    price_paid: number;
    remaining_seats: number;
}

interface Props {
    ride: Ride;
    booking: BookingData;
    onDone: () => void;
}

export default function BookingSuccessSheet({ ride, booking, onDone }: Props) {
    const hasPhone = !!ride.driver_phone;

    const handleWhatsApp = () => {
        const phone = ride.driver_phone?.replace(/[^0-9]/g, '') || '';
        const message = `Hi ${ride.driver_name}! I just booked ${booking.seats_booked} seat(s) on your RideMates ride from ${ride.origin_city} → ${ride.destination_city} on ${formatDepartureTime(ride.departure_time)}. Looking forward to it!`;
        const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => { });
    };

    const handleCall = () => {
        const phone = ride.driver_phone || '';
        Linking.openURL(`tel:${phone}`).catch(() => { });
    };

    return (
        <View style={ds.successRoot}>
            <ScrollView style={ds.successScroll} contentContainerStyle={ds.successContent}>
                {/* Success Header */}
                <View style={ds.successTop}>
                    <View style={ds.successIconWrap}>
                        <MaterialIcons name="check-circle" size={44} color="#22c55e" />
                    </View>
                    <Text style={ds.successTitle}>Seat Booked!</Text>
                    <Text style={ds.successSub}>
                        Your booking with {ride.driver_name} is confirmed
                    </Text>
                </View>

                {/* Booking Summary Card */}
                <View style={ds.successCard}>
                    <Text style={ds.successSectionTitle}>BOOKING SUMMARY</Text>

                    <View style={ds.successRow}>
                        <Text style={ds.successLabel}>Route</Text>
                        <Text style={ds.successValue}>
                            {ride.origin_city} → {ride.destination_city}
                        </Text>
                    </View>

                    <View style={ds.successRow}>
                        <Text style={ds.successLabel}>Departure</Text>
                        <Text style={ds.successValue}>
                            {formatDepartureTime(ride.departure_time)}
                        </Text>
                    </View>

                    <View style={ds.successRow}>
                        <Text style={ds.successLabel}>Seats booked</Text>
                        <Text style={ds.successValue}>{booking.seats_booked}</Text>
                    </View>

                    <View style={ds.successRow}>
                        <Text style={ds.successLabel}>Seats remaining</Text>
                        <Text style={ds.successValue}>{booking.remaining_seats}</Text>
                    </View>

                    <View style={[ds.priceDivider, { marginVertical: 10 }]} />

                    <View style={ds.successRow}>
                        <Text style={ds.successLabel}>Amount to pay (cash)</Text>
                        <Text style={ds.successPriceValue}>₹{Number(booking.price_paid).toFixed(0)}</Text>
                    </View>
                </View>

                {/* Contact Driver */}
                <View style={ds.handoffCard}>
                    <Text style={ds.handoffTitle}>CONTACT DRIVER</Text>

                    {hasPhone ? (
                        <View style={ds.handoffBtnRow}>
                            <TouchableOpacity
                                style={[ds.handoffBtn, ds.whatsappBtn]}
                                onPress={handleWhatsApp}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="chat" size={18} color="#22c55e" />
                                <Text style={ds.whatsappBtnText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[ds.handoffBtn, ds.callBtn]}
                                onPress={handleCall}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="call" size={18} color="#3b82f6" />
                                <Text style={ds.callBtnText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={ds.handoffFallback}>
                            Driver has not shared contact details yet.{'\n'}
                            You'll coordinate at the pickup point.
                        </Text>
                    )}
                </View>

                {/* Done Button */}
                <TouchableOpacity style={ds.doneBtn} onPress={onDone} activeOpacity={0.87}>
                    <MaterialIcons name="home" size={20} color="#fff" />
                    <Text style={ds.doneBtnText}>Back to Home</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
