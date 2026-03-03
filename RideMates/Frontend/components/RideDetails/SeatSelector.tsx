// =============================================================================
// components/RideDetails/SeatSelector.tsx — Seat Count Stepper
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ds } from './styles';

interface Props {
    seats: number;
    maxSeats: number;
    onChange: (n: number) => void;
}

export default function SeatSelector({ seats, maxSeats, onChange }: Props) {
    const canDecrement = seats > 1;
    const canIncrement = seats < maxSeats;

    return (
        <View style={ds.seatSelectorCard}>
            <View style={ds.seatSelectorRow}>
                <View>
                    <Text style={ds.seatSelectorLabel}>Seats to book</Text>
                    <Text style={ds.seatSelectorSub}>
                        {maxSeats} available
                    </Text>
                </View>

                <View style={ds.seatStepper}>
                    <TouchableOpacity
                        style={[
                            ds.seatStepperBtn,
                            !canDecrement && ds.seatStepperBtnDisabled,
                        ]}
                        onPress={() => canDecrement && onChange(seats - 1)}
                        activeOpacity={canDecrement ? 0.7 : 1}
                    >
                        <MaterialIcons
                            name="remove"
                            size={18}
                            color={canDecrement ? '#1a1a1a' : '#ccc'}
                        />
                    </TouchableOpacity>

                    <Text style={ds.seatStepperValue}>{seats}</Text>

                    <TouchableOpacity
                        style={[
                            ds.seatStepperBtn,
                            !canIncrement && ds.seatStepperBtnDisabled,
                        ]}
                        onPress={() => canIncrement && onChange(seats + 1)}
                        activeOpacity={canIncrement ? 0.7 : 1}
                    >
                        <MaterialIcons
                            name="add"
                            size={18}
                            color={canIncrement ? '#1a1a1a' : '#ccc'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
