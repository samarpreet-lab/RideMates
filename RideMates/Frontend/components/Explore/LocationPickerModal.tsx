// =============================================================================
// components/Explore/LocationPickerModal.tsx — Full-Screen Location Picker
// =============================================================================
// Hybrid Geocoding (FR-MAP-01): Local hubs first → Photon API fallback.
// =============================================================================

import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from './styles';
import { ALL_HUBS, QUICK_ORIGINS, QUICK_DESTINATIONS } from './constants';
import usePhotonSearch from '../../hooks/usePhotonSearch';

interface LocationPickerModalProps {
  visible: boolean;
  target: 'origin' | 'destination' | null;
  query: string;
  setQuery: (val: string) => void;
  onSelect: (label: string) => void;
  onClose: () => void;
}

export default function LocationPickerModal({
  visible,
  target,
  query,
  setQuery,
  onSelect,
  onClose,
}: LocationPickerModalProps) {
  const inputRef = useRef<TextInput>(null);

  // Local hub filtering
  const filteredHubs = query.trim().length > 0
    ? ALL_HUBS.filter((h) =>
      h.label.toLowerCase().includes(query.toLowerCase()) ||
      h.subtitle.toLowerCase().includes(query.toLowerCase())
    )
    : ALL_HUBS;

  // Photon fallback (only fires when no local matches & 3+ chars after 450ms)
  const { photonResults, loading: photonLoading } = usePhotonSearch(query, ALL_HUBS, {});

  const quickChips = target === 'origin' ? QUICK_ORIGINS : QUICK_DESTINATIONS;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.locPickerSafe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={s.locPickerHeader}>
          <TouchableOpacity
            style={s.locPickerBackBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={s.locPickerTitle}>
            {target === 'origin' ? 'Choose pickup point' : 'Choose destination'}
          </Text>
        </View>

        {/* Search input */}
        <View style={s.locPickerInputWrap}>
          <MaterialIcons name="search" size={20} color="#C24E00" style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            style={s.locPickerInput}
            placeholder={target === 'origin' ? 'Search pickup...' : 'Search destination...'}
            placeholderTextColor="#bbb"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={18} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>

        {/* Hub list — local results */}
        <FlatList
          data={filteredHubs}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={
            <Text style={s.locPickerSectionLabel}>
              {target === 'origin' ? 'CAMPUS HUBS & PLACES' : 'DESTINATIONS'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.locHubItem}
              onPress={() => onSelect(item.label)}
              activeOpacity={0.75}
            >
              <View style={s.locHubIconWrap}>
                <MaterialIcons name={item.icon} size={20} color="#C24E00" />
              </View>
              <View style={s.locHubTextWrap}>
                <Text style={s.locHubName}>{item.label}</Text>
                <Text style={s.locHubSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#ddd" />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.locHubSeparator} />}
          ListFooterComponent={
            <>
              {/* Photon API results — shown below local hubs */}
              {photonLoading && (
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <ActivityIndicator size="small" color="#C24E00" />
                  <Text style={{ fontSize: 12, color: '#A8937F', marginTop: 6 }}>Searching nearby places...</Text>
                </View>
              )}
              {photonResults.length > 0 && (
                <>
                  <Text style={s.locPickerSectionLabel}>NEARBY PLACES</Text>
                  {photonResults.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={s.locHubItem}
                      onPress={() => onSelect(item.label)}
                      activeOpacity={0.75}
                    >
                      <View style={s.locHubIconWrap}>
                        <MaterialIcons name="public" size={20} color="#6B5344" />
                      </View>
                      <View style={s.locHubTextWrap}>
                        <Text style={s.locHubName}>{item.label}</Text>
                        <Text style={s.locHubSubtitle}>{item.subtitle}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={18} color="#ddd" />
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Quick chips at bottom */}
        <View style={s.locPickerQuickWrap}>
          <Text style={s.locPickerQuickLabel}>Quick select</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6 }}
          >
            {quickChips.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={s.locQuickChip}
                onPress={() => onSelect(q.label)}
                activeOpacity={0.8}
              >
                <MaterialIcons name={q.icon} size={13} color="#C24E00" />
                <Text style={s.locQuickChipText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
