// =============================================================================
// components/RideDetails/PassengerList.tsx — Shows who booked the ride (driver view)
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ds } from './styles';

// Inline helpers
function getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getTrustColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
}

interface Passenger {
    booking_id: number;
    passenger_id: number;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string | null;
    passenger_trust_score: number;
    seats_booked: number;
    price_paid: number;
    booking_status: string;
}

interface Props {
    passengers: Passenger[];
}

export default function PassengerList({ passengers }: Props) {
    if (!passengers || passengers.length === 0) return null;

    const totalSeats = passengers.reduce((sum, p) => sum + p.seats_booked, 0);

    const handleWhatsApp = (phone: string, name: string) => {
        const cleaned = phone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/91${cleaned}?text=${encodeURIComponent(`Hi ${name}! This is your RideMates driver. See you soon!`)}`;
        Linking.openURL(url).catch(() => { });
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`).catch(() => { });
    };

    return (
        <View style={ds.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#bbb', letterSpacing: 0.5 }}>
                    PASSENGERS ({totalSeats} seat{totalSeats > 1 ? 's' : ''} booked)
                </Text>
                <View style={{ backgroundColor: '#fff4eb', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#C24E00' }}>
                        {passengers.length} {passengers.length === 1 ? 'person' : 'people'}
                    </Text>
                </View>
            </View>

            {passengers.map((p, index) => (
                <View key={p.booking_id}>
                    {index > 0 && <View style={{ height: 1, backgroundColor: '#f5f5f5', marginVertical: 12 }} />}

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Avatar */}
                        <View style={{
                            width: 42, height: 42, borderRadius: 21,
                            backgroundColor: '#C24E00', alignItems: 'center', justifyContent: 'center',
                            marginRight: 12,
                        }}>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>
                                {getInitials(p.passenger_name)}
                            </Text>
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a' }}>
                                {p.passenger_name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                <MaterialIcons name="event-seat" size={12} color="#888" />
                                <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>
                                    {p.seats_booked} seat{p.seats_booked > 1 ? 's' : ''}
                                </Text>
                                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddd' }} />
                                <Text style={{ fontSize: 12, fontWeight: '700', color: getTrustColor(p.passenger_trust_score) }}>
                                    {p.passenger_trust_score}★
                                </Text>
                                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddd' }} />
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#C24E00' }}>
                                    ₹{Number(p.price_paid).toFixed(0)}
                                </Text>
                            </View>
                        </View>

                        {/* Contact Buttons */}
                        {!!p.passenger_phone && (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => handleWhatsApp(p.passenger_phone!, p.passenger_name)}
                                    style={{
                                        width: 34, height: 34, borderRadius: 17,
                                        backgroundColor: '#fff4eb', alignItems: 'center', justifyContent: 'center',
                                        borderWidth: 1, borderColor: '#ffe0c4',
                                    }}
                                >
                                    <MaterialIcons name="chat" size={16} color="#C24E00" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleCall(p.passenger_phone!)}
                                    style={{
                                        width: 34, height: 34, borderRadius: 17,
                                        backgroundColor: '#fff4eb', alignItems: 'center', justifyContent: 'center',
                                        borderWidth: 1, borderColor: '#ffe0c4',
                                    }}
                                >
                                    <MaterialIcons name="call" size={16} color="#C24E00" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
}
