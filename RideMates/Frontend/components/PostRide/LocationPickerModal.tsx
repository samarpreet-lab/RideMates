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
import useLocationIQSearch from '../../hooks/useLocationIQSearch';

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

    // LocationIQ search with local hub fallback
    const { results: searchResults, loading } = useLocationIQSearch(locQuery, ALL_HUBS.map(h => ({ ...h, icon: h.icon || 'location-on' })));

    // Show all hubs if no query, otherwise show search results
    const displayResults = locQuery.trim().length === 0 ? ALL_HUBS : searchResults;

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
                    data={displayResults}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                        !loading && locQuery.trim().length > 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                                <MaterialIcons name="location-off" size={32} color="#ddd" />
                                <Text style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>No locations found</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        loading ? (
                            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                <ActivityIndicator size="small" color="#C24E00" />
                                <Text style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>Searching locations...</Text>
                            </View>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={s.locPickerItem}
                            onPress={() => applyLocSelection(item.label, { lat: item.lat, lng: item.lng })}
                            activeOpacity={0.7}
                        >
                            <View style={s.locPickerIcon}>
                                <MaterialIcons name="location-on" size={20} color="#C24E00" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.locPickerItemLabel}>{item.label}</Text>
                                <Text style={s.locPickerItemSub}>{item.subtitle}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#ddd" />
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
}
