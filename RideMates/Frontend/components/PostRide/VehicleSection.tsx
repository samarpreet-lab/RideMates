import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from './styles';
import { VEHICLE_TYPES, FUEL_TYPES } from './constants';

interface VehicleSectionProps {
    vehicleType: 'bike' | 'car';
    setVehicleType: (val: 'bike' | 'car') => void;
    seats: number;
    setSeats: (val: number) => void;
    maxSeats: number;
    mileage: string;
    setMileage: (val: string) => void;
    fuelType: string;
    setFuelType: (val: string) => void;
}

export default function VehicleSection({
    vehicleType, setVehicleType, seats, setSeats, maxSeats,
    mileage, setMileage, fuelType, setFuelType
}: VehicleSectionProps) {
    return (
        <View style={s.sectionCard}>
            <View style={s.sectionHeader}>
                <View style={s.sectionIconCircle}>
                    <MaterialIcons name="directions-car" size={18} color="#F37021" />
                </View>
                <Text style={s.sectionTitle}>Vehicle & Capacity</Text>
            </View>

            {/* Vehicle Type Picker */}
            <Text style={s.fieldLabel}>VEHICLE TYPE</Text>
            <View style={s.segmentedRow}>
                {VEHICLE_TYPES.map((v) => (
                    <TouchableOpacity
                        key={v.id}
                        style={[s.segmentBtn, vehicleType === v.id && s.segmentBtnActive]}
                        onPress={() => setVehicleType(v.id as 'bike' | 'car')}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons
                            name={v.icon}
                            size={20}
                            color={vehicleType === v.id ? '#fff' : '#666'}
                        />
                        <Text style={[s.segmentLabel, vehicleType === v.id && s.segmentLabelActive]}>
                            {v.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Seats Stepper */}
            <Text style={s.fieldLabel}>AVAILABLE SEATS</Text>
            <View style={s.stepperRow}>
                <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() => setSeats(Math.max(1, seats - 1))}
                    activeOpacity={0.7}
                    disabled={seats <= 1}
                >
                    <MaterialIcons name="remove" size={20} color={seats <= 1 ? '#ddd' : '#333'} />
                </TouchableOpacity>
                <View style={s.stepperValueBox}>
                    <MaterialIcons name="event-seat" size={16} color="#F37021" />
                    <Text style={s.stepperValue}>{seats}</Text>
                </View>
                <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() => setSeats(Math.min(maxSeats, seats + 1))}
                    activeOpacity={0.7}
                    disabled={seats >= maxSeats}
                >
                    <MaterialIcons name="add" size={20} color={seats >= maxSeats ? '#ddd' : '#333'} />
                </TouchableOpacity>
            </View>

            {/* Mileage */}
            <Text style={s.fieldLabel}>VEHICLE MILEAGE (km/L)</Text>
            <View style={s.inputRow}>
                <MaterialIcons name="speed" size={18} color="#F37021" />
                <TextInput
                    style={s.textInput}
                    keyboardType="numeric"
                    value={mileage}
                    onChangeText={setMileage}
                    placeholder="e.g. 15"
                    placeholderTextColor="#ccc"
                />
                <Text style={s.inputSuffix}>km/L</Text>
            </View>

            {/* Fuel Type */}
            <Text style={s.fieldLabel}>FUEL TYPE</Text>
            <View style={s.chipsRow}>
                {FUEL_TYPES.map((f) => (
                    <TouchableOpacity
                        key={f.id}
                        style={[s.chip, fuelType === f.id && s.chipActive]}
                        onPress={() => setFuelType(f.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.chipText, fuelType === f.id && s.chipTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
