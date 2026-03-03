import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { s } from './styles';

interface PricingSectionProps {
    distanceKm: number;
    vehicleType: string;
    driverPrice: number;
    setDriverPrice: (val: number) => void;
    basePrice: number;
    maxAllowed: number;
    seats: number;
    perSeat: number;
    instantBooking: boolean;
    setInstantBooking: (val: boolean) => void;
    instantAck: boolean;
    setInstantAck: (val: boolean) => void;
    isFemale: boolean;
    womenOnly: boolean;
    setWomenOnly: (val: boolean) => void;
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

export default function PricingSection({
    distanceKm, vehicleType, driverPrice, setDriverPrice,
    basePrice, maxAllowed, seats, perSeat,
    instantBooking, setInstantBooking, instantAck, setInstantAck,
    isFemale, womenOnly, setWomenOnly
}: PricingSectionProps) {
    return (
        <View style={s.sectionCard}>
            <View style={s.sectionHeader}>
                <View style={s.sectionIconCircle}>
                    <MaterialIcons name="currency-rupee" size={18} color="#F37021" />
                </View>
                <Text style={s.sectionTitle}>Pricing & Rules</Text>
            </View>

            {distanceKm > 0 ? (
                <>
                    {/* Price breakdown */}
                    <View style={s.priceBreakdown}>
                        <View style={s.priceRow}>
                            <Text style={s.priceLabel}>Base fuel cost</Text>
                            <Text style={s.priceValue}>₹{basePrice}</Text>
                        </View>
                        <View style={s.priceRow}>
                            <Text style={s.priceLabel}>
                                Multiplier ({vehicleType === 'bike' ? '1.2x' : '1.5x'})
                            </Text>
                            <Text style={s.priceValue}>₹{maxAllowed}</Text>
                        </View>
                        <View style={[s.priceRow, s.priceRowHighlight]}>
                            <Text style={s.priceLabelBold}>Max allowed price</Text>
                            <Text style={s.priceValueBold}>₹{maxAllowed}</Text>
                        </View>
                    </View>

                    {/* Price Slider */}
                    <Text style={s.fieldLabel}>YOUR PRICE</Text>
                    <View style={s.sliderContainer}>
                        <Text style={s.sliderMin}>₹0</Text>
                        <Slider
                            style={s.slider}
                            minimumValue={0}
                            maximumValue={maxAllowed || 1}
                            step={5}
                            value={driverPrice}
                            onValueChange={setDriverPrice}
                            minimumTrackTintColor="#F37021"
                            maximumTrackTintColor="#e0e0e0"
                            thumbTintColor="#F37021"
                        />
                        <Text style={s.sliderMax}>₹{maxAllowed}</Text>
                    </View>
                    <View style={s.sliderValueRow}>
                        <Text style={s.sliderCurrentLabel}>You'll charge:</Text>
                        <Text style={s.sliderCurrentValue}>₹{round2(driverPrice)}</Text>
                    </View>
                    {seats > 1 && (
                        <Text style={s.perSeatNote}>
                            ≈ ₹{perSeat} per seat
                        </Text>
                    )}
                </>
            ) : (
                <View style={s.pricePlaceholder}>
                    <MaterialIcons name="info-outline" size={20} color="#bbb" />
                    <Text style={s.pricePlaceholderText}>
                        Select both origin and destination to see pricing
                    </Text>
                </View>
            )}

            {/* Instant Booking Toggle */}
            <View style={[s.toggleRow, { marginTop: 16 }]}>
                <View style={s.toggleLeft}>
                    <MaterialIcons name="flash-on" size={18} color="#1976d2" />
                    <View style={{ flex: 1 }}>
                        <Text style={s.toggleTitle}>Instant Booking</Text>
                        <Text style={s.toggleSub}>Passengers can auto-book without your approval</Text>
                    </View>
                </View>
                <Switch
                    value={instantBooking}
                    onValueChange={(v) => { setInstantBooking(v); if (!v) setInstantAck(false); }}
                    trackColor={{ false: '#e0e0e0', true: '#bbdefb' }}
                    thumbColor={instantBooking ? '#1976d2' : '#ccc'}
                />
            </View>

            {/* Trust Contract (only if instant booking ON) */}
            {instantBooking && (
                <TouchableOpacity
                    style={[s.ackRow, instantAck && s.ackRowChecked]}
                    onPress={() => setInstantAck(!instantAck)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name={instantAck ? 'check-box' : 'check-box-outline-blank'}
                        size={22}
                        color={instantAck ? '#1976d2' : '#bbb'}
                    />
                    <Text style={s.ackText}>
                        I agree to a -5 Trust Point penalty if I cancel this ride within 30 mins of departure.
                    </Text>
                </TouchableOpacity>
            )}

            {/* Women-Only Toggle (disabled for male) */}
            {isFemale && (
                <View style={[s.toggleRow, { marginTop: 12 }]}>
                    <View style={s.toggleLeft}>
                        <MaterialIcons name="female" size={18} color="#c2185b" />
                        <View style={{ flex: 1 }}>
                            <Text style={s.toggleTitle}>Women Only</Text>
                            <Text style={s.toggleSub}>Only female passengers can book</Text>
                        </View>
                    </View>
                    <Switch
                        value={womenOnly}
                        onValueChange={setWomenOnly}
                        trackColor={{ false: '#e0e0e0', true: '#f8bbd0' }}
                        thumbColor={womenOnly ? '#c2185b' : '#ccc'}
                    />
                </View>
            )}
        </View>
    );
}
