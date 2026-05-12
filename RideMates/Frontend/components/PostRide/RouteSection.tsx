import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from './styles';
import { formatDistanceKm } from '../Explore/constants';

interface RouteSectionProps {
    origin: string;
    destination: string;
    distanceKm: number;
    departureDate: Date;
    departureTime: Date;
    isEmergencyRoute: boolean;
    setLocPickerTarget: (val: 'origin' | 'destination' | null) => void;
    setLocQuery: (val: string) => void;
    setShowDatePicker: (val: boolean) => void;
    setShowTimePicker: (val: boolean) => void;
    setIsEmergencyRoute: (val: boolean) => void;
}

export default function RouteSection({
    origin, destination, distanceKm, departureDate, departureTime,
    isEmergencyRoute, setLocPickerTarget, setLocQuery, setShowDatePicker,
    setShowTimePicker, setIsEmergencyRoute
}: RouteSectionProps) {
    return (
        <View style={s.sectionCard}>
            <View style={s.sectionHeader}>
                <View style={s.sectionIconCircle}>
                    <MaterialIcons name="route" size={18} color="#C24E00" />
                </View>
                <Text style={s.sectionTitle}>Route Details</Text>
            </View>

            {/* Origin */}
            <Text style={s.fieldLabel}>FROM</Text>
            <TouchableOpacity
                style={s.locationField}
                onPress={() => { setLocQuery(origin); setLocPickerTarget('origin'); }}
                activeOpacity={0.7}
            >
                <View style={s.originDot} />
                <Text style={origin ? s.locationText : s.locationPlaceholder}>
                    {origin || 'Select pickup point'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            {/* Destination */}
            <Text style={s.fieldLabel}>TO</Text>
            <TouchableOpacity
                style={s.locationField}
                onPress={() => { setLocQuery(destination); setLocPickerTarget('destination'); }}
                activeOpacity={0.7}
            >
                <View style={s.destDot} />
                <Text style={destination ? s.locationText : s.locationPlaceholder}>
                    {destination || 'Select destination'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            {/* Distance badge */}
            {distanceKm > 0 && (
                <View style={s.distanceBadge}>
                    <MaterialIcons name="straighten" size={14} color="#C24E00" />
                    <Text style={s.distanceText}>{formatDistanceKm(distanceKm)}</Text>
                </View>
            )}

            {/* Departure Date & Time */}
            <Text style={s.fieldLabel}>DEPARTURE</Text>
            <View style={s.dateTimeRow}>
                <TouchableOpacity style={s.dateTimeBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                    <MaterialIcons name="calendar-today" size={16} color="#C24E00" />
                    <Text style={s.dateTimeBtnText}>
                        {departureDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.dateTimeBtn} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
                    <MaterialIcons name="schedule" size={16} color="#C24E00" />
                    <Text style={s.dateTimeBtnText}>
                        {departureTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Emergency Route Toggle */}
            <View style={s.toggleRow}>
                <View style={s.toggleLeft}>
                    <MaterialIcons name="warning-amber" size={18} color="#f59e0b" />
                    <View style={{ flex: 1 }}>
                        <Text style={s.toggleTitle}>Strike Resilience Mode</Text>
                        <Text style={s.toggleSub}>Uses link-roads to bypass highway disruptions</Text>
                    </View>
                </View>
                <Switch
                    value={isEmergencyRoute}
                    onValueChange={setIsEmergencyRoute}
                    trackColor={{ false: '#e0e0e0', true: '#fde68a' }}
                    thumbColor={isEmergencyRoute ? '#f59e0b' : '#ccc'}
                />
            </View>
        </View>
    );
}
