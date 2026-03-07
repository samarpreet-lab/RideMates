// =============================================================================
// components/RideDetails/BookingSuccessSheet.tsx — Post-Booking Confirmation
// =============================================================================
// SRS: BookingSuccess Component (Section 9.3)
//   - Confirmation message, booking summary
//   - WhatsApp button (wa.me) and Call button (tel:)
//   - Fallback when driver has no phone
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
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
    passengerName?: string;
    isPending?: boolean;
    onDone: () => void;
}

export default function BookingSuccessSheet({ ride, booking, passengerName, isPending = false, onDone }: Props) {
    const hasPhone = !!ride.driver_phone;

    const handleWhatsApp = async () => {
        const raw = ride.driver_phone?.replace(/\D/g, '') || '';
        const finalPhone = raw.length === 10 ? `91${raw}` : raw;
        const name = passengerName?.trim() || 'A passenger';
        const message =
            `Hi ${ride.driver_name}! I'm ${name} from RideMates. 🚗\n` +
            `I just booked a seat on your ride from *${ride.origin_city}* to *${ride.destination_city}*.\n` +
            `Where exactly should we meet for pickup?`;
        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url).catch(() => {});
        } else {
            Alert.alert('WhatsApp Not Found', 'WhatsApp is not installed on this device.');
        }
    };

    const handleCall = async () => {
        const url = `tel:${ride.driver_phone || ''}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url).catch(() => {});
        }
    };

    return (
        <View style={ds.successRoot}>
            <ScrollView style={ds.successScroll} contentContainerStyle={ds.successContent}>
                {/* Success Header */}
                <View style={ds.successTop}>
                    <View style={ds.successIconWrap}>
                        <MaterialIcons
                            name={isPending ? 'hourglass-top' : 'check-circle'}
                            size={44}
                            color={isPending ? '#f59e0b' : '#C24E00'}
                        />
                    </View>
                    <Text style={ds.successTitle}>{isPending ? 'Request Sent!' : 'Seat Booked!'}</Text>
                    <Text style={ds.successSub}>
                        {isPending
                            ? `Your request has been sent to ${ride.driver_name}. You\'ll be notified once they accept.`
                            : `Your booking with ${ride.driver_name} is confirmed`}
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

                {/* Contact Driver — only shown once booking is confirmed */}
                {!isPending && (
                <View style={ds.handoffCard}>
                    <Text style={ds.handoffTitle}>CONTACT DRIVER</Text>

                    {hasPhone ? (
                        <View style={ds.handoffBtnRow}>
                            <TouchableOpacity
                                style={[ds.handoffBtn, ds.whatsappBtn]}
                                onPress={handleWhatsApp}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="chat" size={18} color="#C24E00" />
                                <Text style={ds.whatsappBtnText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[ds.handoffBtn, ds.callBtn]}
                                onPress={handleCall}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="call" size={18} color="#C24E00" />
                                <Text style={ds.callBtnText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={ds.handoffFallback}>
                            Driver has not linked a phone number. Check back later.
                        </Text>
                    )}
                </View>
                )}

                {/* Done Button */}
                <TouchableOpacity style={ds.doneBtn} onPress={onDone} activeOpacity={0.87}>
                    <MaterialIcons name="home" size={20} color="#fff" />
                    <Text style={ds.doneBtnText}>Back to Home</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
