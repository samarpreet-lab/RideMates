import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { s } from './styles';

interface PricingSectionProps {
    distanceKm: number;
    vehicleType: string;
    driverPrice: number;         // per-seat
    setDriverPrice: (val: number) => void;
    basePrice: number;           // total fuel cost (reference)
    basePerSeat: number;         // green zone start
    recommendedPerSeat: number;  // green zone ceiling
    maxPerSeat: number;          // hard cap
    seats: number;
    totalEarnings: number;
    instantBooking: boolean;
    setInstantBooking: (val: boolean) => void;
    instantAck: boolean;
    setInstantAck: (val: boolean) => void;
    isFemale: boolean;
    womenOnly: boolean;
    setWomenOnly: (val: boolean) => void;
}

function round2(n: number): number {
    return Math.round(n);
}

type Zone = 'green' | 'yellow';

function getZone(price: number, recommendedPerSeat: number): Zone {
    return price <= recommendedPerSeat ? 'green' : 'yellow';
}

const ZONE_CONFIG = {
    green:  { label: '✓ Fair Price',    bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32' },
    yellow: { label: '↑ Within Range',  bg: '#FFF8E1', border: '#FFD54F', text: '#E65100' },
};

export default function PricingSection({
    distanceKm, vehicleType, driverPrice, setDriverPrice,
    basePrice, basePerSeat, recommendedPerSeat, maxPerSeat,
    seats, totalEarnings,
    instantBooking, setInstantBooking, instantAck, setInstantAck,
    isFemale, womenOnly, setWomenOnly
}: PricingSectionProps) {

    const zone = getZone(driverPrice, recommendedPerSeat);
    const badge = ZONE_CONFIG[zone];
    const multiplierLabel = vehicleType === 'bike' ? '1.5×' : vehicleType === 'car' ? '1.25×' : '1.35×';

    return (
        <View style={s.sectionCard}>
            <View style={s.sectionHeader}>
                <View style={s.sectionIconCircle}>
                    <MaterialIcons name="currency-rupee" size={18} color="#C24E00" />
                </View>
                <Text style={s.sectionTitle}>Pricing & Rules</Text>
            </View>

            {distanceKm > 0 ? (
                <>
                    {/* Zone breakdown */}
                    <View style={s.priceBreakdown}>
                        {/* Green zone start */}
                        <View style={s.priceRow}>
                            <View style={s.priceZoneDot}>
                                <View style={[s.zoneDot, { backgroundColor: '#4CAF50' }]} />
                                <Text style={s.priceLabel}>Per seat — fuel only</Text>
                            </View>
                            <Text style={[s.priceValue, { color: '#2E7D32' }]}>₹{basePerSeat}</Text>
                        </View>

                        {/* Row 3: Hard cap */}
                        <View style={[s.priceRow, s.priceRowHighlight]}>
                            <View style={s.priceZoneDot}>
                                <View style={[s.zoneDot, { backgroundColor: '#C24E00' }]} />
                                <Text style={s.priceLabelBold}>Hard cap ({multiplierLabel})</Text>
                            </View>
                            <Text style={s.priceValueBold}>₹{maxPerSeat}</Text>
                        </View>
                    </View>

                    {/* Slider header with zone badge */}
                    <View style={s.sliderHeaderRow}>
                        <Text style={s.fieldLabel}>YOUR PRICE PER SEAT</Text>
                        <View style={[s.zoneBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                            <Text style={[s.zoneBadgeText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                    </View>

                    {/* Slider */}
                    <View style={s.sliderContainer}>
                        <Text style={s.sliderMin}>₹{basePerSeat}</Text>
                        <Slider
                            style={s.slider}
                            minimumValue={basePerSeat || 0}
                            maximumValue={maxPerSeat || 1}
                            step={1}
                            value={driverPrice}
                            onValueChange={(v) => setDriverPrice(round2(v))}
                            minimumTrackTintColor={zone === 'green' ? '#4CAF50' : '#E65100'}
                            maximumTrackTintColor="#e0e0e0"
                            thumbTintColor={zone === 'green' ? '#4CAF50' : '#C24E00'}
                        />
                        <Text style={s.sliderMax}>₹{maxPerSeat}</Text>
                    </View>

                    {/* Zone markers below slider */}
                    <View style={s.zoneMarkersRow}>
                        <Text style={s.zoneMarkerGreen}>Fuel</Text>
                        <Text style={s.zoneMarkerRed}>Cap ₹{maxPerSeat}</Text>
                    </View>

                    {/* Current value */}
                    <View style={s.sliderValueRow}>
                        <Text style={s.sliderCurrentLabel}>Per seat:</Text>
                        <Text style={[s.sliderCurrentValue, { color: zone === 'green' ? '#2E7D32' : '#C24E00' }]}>
                            ₹{round2(driverPrice)}
                        </Text>
                    </View>

                    {/* Total earnings estimate */}
                    <View style={s.totalEarningsRow}>
                        <MaterialIcons name="account-balance-wallet" size={14} color="#6B5344" />
                        <Text style={s.totalEarningsText}>
                            ₹{totalEarnings} total ({seats} seat{seats > 1 ? 's' : ''})
                        </Text>
                    </View>
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
