// =============================================================================
// components/RideDetails/PassengerList.tsx — Shows who booked the ride (driver view)
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
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

interface RideInfo {
    origin_city: string;
    destination_city: string;
}

interface Props {
    passengers: Passenger[];
    rideInfo?: RideInfo;
    onAccept?: (bookingId: number) => void;
    onReject?: (bookingId: number) => void;
}

export default function PassengerList({ passengers, rideInfo, onAccept, onReject }: Props) {
    if (!passengers || passengers.length === 0) return null;

    const pendingPassengers   = passengers.filter(p => p.booking_status === 'pending');
    const confirmedPassengers = passengers.filter(p => p.booking_status !== 'pending');
    const totalSeats = confirmedPassengers.reduce((sum, p) => sum + p.seats_booked, 0);

    const handleWhatsApp = async (phone: string, name: string) => {
        const cleaned = phone.replace(/\D/g, '');
        const finalPhone = cleaned.length === 10 ? `91${cleaned}` : cleaned;
        const routePart = rideInfo
            ? ` for our *${rideInfo.origin_city}* → *${rideInfo.destination_city}* ride`
            : '';
        const message =
            `Hi ${name}! This is your RideMates driver${routePart}. ` +
            `I'm heading to the pickup point — what's your ETA? 🚗`;
        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url).catch(() => {});
        } else {
            Alert.alert('WhatsApp Not Found', 'WhatsApp is not installed on this device.');
        }
    };

    const handleCall = async (phone: string) => {
        const url = `tel:${phone}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url).catch(() => {});
        }
    };

    return (
        <View>
            {/* ── Pending Requests ── */}
            {pendingPassengers.length > 0 && (
                <View style={[ds.card, { borderColor: '#f59e0b', borderWidth: 1.5, marginBottom: 12 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#f59e0b', letterSpacing: 0.5 }}>
                            PENDING REQUESTS ({pendingPassengers.length})
                        </Text>
                        <View style={{ backgroundColor: '#fff9eb', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#f59e0b' }}>Awaiting your approval</Text>
                        </View>
                    </View>

                    {pendingPassengers.map((p, index) => (
                        <View key={p.booking_id}>
                            {index > 0 && <View style={{ height: 1, backgroundColor: '#fef3c7', marginVertical: 12 }} />}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{getInitials(p.passenger_name)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a' }}>{p.passenger_name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                        <MaterialIcons name="event-seat" size={12} color="#888" />
                                        <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>{p.seats_booked} seat{p.seats_booked > 1 ? 's' : ''}</Text>
                                        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddd' }} />
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: getTrustColor(p.passenger_trust_score) }}>{p.passenger_trust_score}★</Text>
                                        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddd' }} />
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#C24E00' }}>₹{Number(p.price_paid).toFixed(0)}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                <TouchableOpacity
                                    onPress={() => onAccept?.(p.booking_id)}
                                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#C24E00', borderRadius: 10, paddingVertical: 10 }}
                                    activeOpacity={0.82}
                                >
                                    <MaterialIcons name="check" size={16} color="#fff" />
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onReject?.(p.booking_id)}
                                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: '#ef4444' }}
                                    activeOpacity={0.82}
                                >
                                    <MaterialIcons name="close" size={16} color="#ef4444" />
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444' }}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* ── Confirmed Passengers ── */}
            {confirmedPassengers.length > 0 && (
                <View style={ds.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#bbb', letterSpacing: 0.5 }}>
                            PASSENGERS ({totalSeats} seat{totalSeats > 1 ? 's' : ''} booked)
                        </Text>
                        <View style={{ backgroundColor: '#fff4eb', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#C24E00' }}>
                                {confirmedPassengers.length} {confirmedPassengers.length === 1 ? 'person' : 'people'}
                            </Text>
                        </View>
                    </View>

                    {confirmedPassengers.map((p, index) => (
                        <View key={p.booking_id}>
                            {index > 0 && <View style={{ height: 1, backgroundColor: '#f5f5f5', marginVertical: 12 }} />}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#C24E00', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{getInitials(p.passenger_name)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a' }}>{p.passenger_name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                        <MaterialIcons name="event-seat" size={12} color="#888" />
                                        <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>{p.seats_booked} seat{p.seats_booked > 1 ? 's' : ''}</Text>
                                        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddd' }} />
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: getTrustColor(p.passenger_trust_score) }}>{p.passenger_trust_score}★</Text>
                                        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddd' }} />
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#C24E00' }}>₹{Number(p.price_paid).toFixed(0)}</Text>
                                    </View>
                                </View>
                                {!!p.passenger_phone && (
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            onPress={() => handleWhatsApp(p.passenger_phone!, p.passenger_name)}
                                            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff4eb', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffe0c4' }}
                                        >
                                            <MaterialIcons name="chat" size={16} color="#C24E00" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleCall(p.passenger_phone!)}
                                            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff4eb', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffe0c4' }}
                                        >
                                            <MaterialIcons name="call" size={16} color="#C24E00" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
