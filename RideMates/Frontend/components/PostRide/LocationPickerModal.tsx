// =============================================================================
// components/PostRide/LocationPickerModal.tsx — Location Picker with Photon
// =============================================================================
// Hybrid Geocoding (FR-MAP-01): Local hubs first → Photon API fallback.
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from './styles';
import { ALL_HUBS, HUB_COORDS } from './constants';
import usePhotonSearch from '../../hooks/usePhotonSearch';

interface LocationPickerModalProps {
    locPickerTarget: 'origin' | 'destination' | null;
    setLocPickerTarget: (val: 'origin' | 'destination' | null) => void;
    locQuery: string;
    setLocQuery: (val: string) => void;
    applyLocSelection: (label: string, coords?: { lat: number; lng: number }) => void;
}

export default function LocationPickerModal({
    locPickerTarget, setLocPickerTarget, locQuery, setLocQuery, applyLocSelection
}: LocationPickerModalProps) {

    const filteredHubs = locQuery.trim().length > 0
        ? ALL_HUBS.filter((h) =>
            h.label.toLowerCase().includes(locQuery.toLowerCase()) ||
            h.subtitle.toLowerCase().includes(locQuery.toLowerCase())
        )
        : ALL_HUBS;

    // Photon fallback (only fires when no local matches & 3+ chars after 450ms)
    const { photonResults, loading: photonLoading } = usePhotonSearch(locQuery, ALL_HUBS, HUB_COORDS);

    return (
        <Modal
            visible={locPickerTarget !== null}
            animationType="slide"
            transparent={false}
            onRequestClose={() => { setLocPickerTarget(null); setLocQuery(''); }}
        >
            <SafeAreaView style={s.locPickerSafe}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <View style={s.locPickerHeader}>
                    <TouchableOpacity
                        style={s.locPickerBackBtn}
                        onPress={() => { setLocPickerTarget(null); setLocQuery(''); }}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="arrow-back" size={22} color="#1a1a1a" />
                    </TouchableOpacity>
                    <Text style={s.locPickerTitle}>
                        {locPickerTarget === 'origin' ? 'Select Pickup' : 'Select Destination'}
                    </Text>
                </View>
                <View style={s.locPickerSearchBar}>
                    <MaterialIcons name="search" size={20} color="#aaa" />
                    <TextInput
                        style={s.locPickerInput}
                        placeholder="Search location..."
                        placeholderTextColor="#bbb"
                        value={locQuery}
                        onChangeText={setLocQuery}
                        autoFocus
                    />
                    {locQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setLocQuery('')}>
                            <MaterialIcons name="close" size={18} color="#bbb" />
                        </TouchableOpacity>
                    )}
                </View>
                <FlatList
                    data={filteredHubs}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={s.locPickerItem}
                            onPress={() => applyLocSelection(item.label, HUB_COORDS[item.label])}
                            activeOpacity={0.7}
                        >
                            <View style={s.locPickerIcon}>
                                <MaterialIcons name={item.icon} size={20} color="#C24E00" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.locPickerItemLabel}>{item.label}</Text>
                                <Text style={s.locPickerItemSub}>{item.subtitle}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#ddd" />
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        <>
                            {/* Photon API results — below local hubs */}
                            {photonLoading && (
                                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                    <ActivityIndicator size="small" color="#C24E00" />
                                    <Text style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>Searching nearby places...</Text>
                                </View>
                            )}
                            {photonResults.length > 0 && photonResults.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={s.locPickerItem}
                                    onPress={() => applyLocSelection(item.label, { lat: item.lat, lng: item.lng })}
                                    activeOpacity={0.7}
                                >
                                    <View style={s.locPickerIcon}>
                                        <MaterialIcons name="public" size={20} color="#6B5344" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.locPickerItemLabel}>{item.label}</Text>
                                        <Text style={s.locPickerItemSub}>{item.subtitle}</Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color="#ddd" />
                                </TouchableOpacity>
                            ))}
                        </>
                    }
                    ListEmptyComponent={
                        !photonLoading && photonResults.length === 0 ? (
                            <View style={{ alignItems: 'center', padding: 40 }}>
                                <MaterialIcons name="search-off" size={40} color="#ddd" />
                                <Text style={{ color: '#aaa', marginTop: 8 }}>No locations found</Text>
                            </View>
                        ) : null
                    }
                />
            </SafeAreaView>
        </Modal>
    );
}
