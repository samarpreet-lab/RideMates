// =============================================================================
// components/RideDetails/EditRideModal.tsx — Edit driver's published ride
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Modal, Switch,
    ActivityIndicator, TextInput, Platform, ScrollView,
    KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ds } from './styles';
import { Ride, parseRideDateTime } from '../Explore/constants';

interface EditRideModalProps {
    visible: boolean;
    ride: Ride;
    onClose: () => void;
    onSave: (updates: Partial<Ride>) => Promise<boolean>;
    onSaveSuccess?: () => void;
}

export default function EditRideModal({ visible, ride, onClose, onSave, onSaveSuccess }: EditRideModalProps) {
    const [loading, setLoading] = useState(false);

    // Parse departure time safely
    const parseDate = (dateStr: string | Date | undefined): Date => {
        const parsed = parseRideDateTime(dateStr);
        return parsed ?? new Date();
    };

    const [departureDate, setDepartureDate] = useState<Date>(() => parseDate(ride.departure_time));
    const [departureTime, setDepartureTime] = useState<Date>(() => parseDate(ride.departure_time));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [seats, setSeats] = useState(ride.available_seats);
    const [price, setPrice] = useState(String(ride.capped_price));
    const [isEmergency, setIsEmergency] = useState(!!ride.is_emergency_route);
    const [isWomenOnly, setIsWomenOnly] = useState(!!ride.is_women_only);

    useEffect(() => {
        if (visible && ride) {
            const parsedDate = parseDate(ride.departure_time);
            setDepartureDate(new Date(parsedDate));
            setDepartureTime(new Date(parsedDate));
            setSeats(ride.available_seats ?? 3);
            setPrice(String(ride.capped_price ?? '0'));
            setIsEmergency(!!ride.is_emergency_route);
            setIsWomenOnly(!!ride.is_women_only);
        }
    }, [visible, ride]);

    const getCombinedDateTime = () => {
        const d = new Date(departureDate);
        d.setHours(departureTime.getHours(), departureTime.getMinutes(), 0, 0);
        // Keep local time instead of converting to UTC
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        const secs = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${mins}:${secs}`; // MySQL format
    };

    const handleSave = async () => {
        setLoading(true);
        const success = await onSave({
            departure_time: getCombinedDateTime() as any, // passed as string
            available_seats: seats,
            driver_set_price: parseFloat(price) || 0,
            is_emergency_route: isEmergency ? 1 : 0 as any,
            is_women_only: isWomenOnly ? 1 : 0 as any,
        });
        if (success) {
            onSaveSuccess?.();
            onClose();
        }
        setLoading(false);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={ds.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%', justifyContent: 'flex-end', flex: 1 }}
                >
                    <View style={ds.modalContent}>
                        <View style={ds.modalHeader}>
                            <Text style={ds.modalTitle}>Edit Ride</Text>
                            <TouchableOpacity onPress={onClose} style={ds.modalCloseBtn}>
                                <MaterialIcons name="close" size={20} color="#444" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Date & Time */}
                            <View style={ds.modalFieldWrap}>
                                <Text style={ds.modalFieldLabel}>Departure Date & Time</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity style={[ds.modalInputBox, { flex: 1.5 }]} onPress={() => setShowDatePicker(true)}>
                                        <MaterialIcons name="event" size={18} color="#C24E00" style={{ marginRight: 8 }} />
                                        <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: '600' }}>
                                            {departureDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[ds.modalInputBox, { flex: 1 }]} onPress={() => setShowTimePicker(true)}>
                                        <MaterialIcons name="schedule" size={18} color="#C24E00" style={{ marginRight: 8 }} />
                                        <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: '600' }}>
                                            {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Seats */}
                            <View style={ds.modalFieldWrap}>
                                <Text style={ds.modalFieldLabel}>Available Seats</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        style={ds.seatStepperBtn}
                                        disabled={seats <= 1}
                                        onPress={() => setSeats(Math.max(1, seats - 1))}
                                    >
                                        <MaterialIcons name="remove" size={18} color={seats <= 1 ? '#ccc' : '#1a1a1a'} />
                                    </TouchableOpacity>

                                    <Text style={[ds.seatStepperValue, { fontSize: 20, marginHorizontal: 20 }]}>{seats}</Text>

                                    <TouchableOpacity
                                        style={ds.seatStepperBtn}
                                        disabled={seats >= 6} // general bound
                                        onPress={() => setSeats(Math.min(6, seats + 1))}
                                    >
                                        <MaterialIcons name="add" size={18} color={seats >= 6 ? '#ccc' : '#1a1a1a'} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Price */}
                            <View style={ds.modalFieldWrap}>
                                <Text style={ds.modalFieldLabel}>Total Trip Price (₹)</Text>
                                <View style={ds.modalInputBox}>
                                    <MaterialIcons name="currency-rupee" size={18} color="#888" style={{ marginRight: 4 }} />
                                    <TextInput
                                        style={{ flex: 1, fontSize: 16, fontWeight: '700', color: '#1a1a1a', padding: 0 }}
                                        keyboardType="numeric"
                                        value={price}
                                        onChangeText={setPrice}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <Text style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                                    Note: The system will automatically cap this price to ensure fair constraints.
                                </Text>
                            </View>

                            {/* Toggles */}
                            <View style={[ds.modalFieldWrap, { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 16 }]}>
                                <View style={ds.modalSwitchRow}>
                                    <View style={{ flex: 1, paddingRight: 16 }}>
                                        <Text style={ds.modalSwitchLabel}>Emergency Route</Text>
                                        <Text style={ds.modalSwitchSub}>Mark this ride as an urgent need.</Text>
                                    </View>
                                    <Switch
                                        value={isEmergency}
                                        onValueChange={setIsEmergency}
                                        trackColor={{ false: '#e0e0e0', true: '#fddcb8' }}
                                        thumbColor={isEmergency ? '#C24E00' : '#f4f3f4'}
                                    />
                                </View>

                                <View style={[ds.modalSwitchRow, { marginTop: 12 }]}>
                                    <View style={{ flex: 1, paddingRight: 16 }}>
                                        <Text style={ds.modalSwitchLabel}>Women Only</Text>
                                        <Text style={ds.modalSwitchSub}>Only female passengers can book.</Text>
                                    </View>
                                    <Switch
                                        value={isWomenOnly}
                                        onValueChange={setIsWomenOnly}
                                        trackColor={{ false: '#e0e0e0', true: '#fce7f3' }}
                                        thumbColor={isWomenOnly ? '#db2777' : '#f4f3f4'}
                                    />
                                </View>
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={ds.modalSaveBtn}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <MaterialIcons name="save" size={20} color="#fff" />
                                        <Text style={ds.modalSaveBtnText}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>

            {/* Date/Time Pickers */}
            {showDatePicker && (
                <DateTimePicker
                    value={departureDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    onChange={(e: DateTimePickerEvent, date?: Date) => {
                        setShowDatePicker(false);
                        if (e.type === 'set' && date) setDepartureDate(date);
                    }}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={departureTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e: DateTimePickerEvent, time?: Date) => {
                        setShowTimePicker(false);
                        if (e.type === 'set' && time) setDepartureTime(time);
                    }}
                />
            )}
        </Modal>
    );
}
