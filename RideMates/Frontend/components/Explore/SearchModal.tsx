// =============================================================================
// components/Explore/SearchModal.tsx — Search Ride Modal (Form + Results)
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from './styles';
import { Ride, QUICK_ORIGINS, QUICK_DESTINATIONS, DATE_OPTIONS } from './constants';
import RideCard from './RideCard';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;

  // Route
  origin: string;
  destination: string;
  setOrigin: (val: string) => void;
  setDestination: (val: string) => void;
  onSwapRoute: () => void;
  onOpenLocPicker: (target: 'origin' | 'destination') => void;

  // Date
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  customDate: Date | null;
  onOpenDatePicker: () => void;

  // Seats
  seatCount: number;
  setSeatCount: (val: number) => void;

  // Search
  searchLoading: boolean;
  onSearchRides: () => void;

  // Results
  searchView: 'form' | 'results';
  setSearchView: (val: 'form' | 'results') => void;
  searchResults: Ride[];
}

export default function SearchModal({
  visible,
  onClose,
  origin,
  destination,
  setOrigin,
  setDestination,
  onSwapRoute,
  onOpenLocPicker,
  selectedDate,
  setSelectedDate,
  customDate,
  onOpenDatePicker,
  seatCount,
  setSeatCount,
  searchLoading,
  onSearchRides,
  searchView,
  setSearchView,
  searchResults,
}: SearchModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={s.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={s.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[s.modalSheet, searchView === 'results' && s.modalSheetResults]}>
          {/* Modal Handle */}
          <View style={s.modalHandle} />

          {/* Header */}
          <View style={s.modalHeader}>
            {searchView === 'results' ? (
              <TouchableOpacity
                onPress={() => setSearchView('form')}
                style={s.modalBackBtn}
              >
                <MaterialIcons name="arrow-back" size={20} color="#1a1a1a" />
              </TouchableOpacity>
            ) : null}
            <Text style={s.modalTitle}>
              {searchView === 'results'
                ? `${searchResults.length} Ride${searchResults.length !== 1 ? 's' : ''} Found`
                : 'Find a Ride'}
            </Text>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {searchView === 'form' ? (
            <SearchForm
              origin={origin}
              destination={destination}
              setOrigin={setOrigin}
              setDestination={setDestination}
              onSwapRoute={onSwapRoute}
              onOpenLocPicker={onOpenLocPicker}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              customDate={customDate}
              onOpenDatePicker={onOpenDatePicker}
              seatCount={seatCount}
              setSeatCount={setSeatCount}
              searchLoading={searchLoading}
              onSearchRides={onSearchRides}
            />
          ) : (
            <SearchResults
              origin={origin}
              destination={destination}
              searchResults={searchResults}
              onEditSearch={() => setSearchView('form')}
              onDismissModal={onClose}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Search Form (origin/dest, quick selects, date, seats, CTA) ────────────

interface SearchFormProps {
  origin: string;
  destination: string;
  setOrigin: (val: string) => void;
  setDestination: (val: string) => void;
  onSwapRoute: () => void;
  onOpenLocPicker: (target: 'origin' | 'destination') => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  customDate: Date | null;
  onOpenDatePicker: () => void;
  seatCount: number;
  setSeatCount: (val: number) => void;
  searchLoading: boolean;
  onSearchRides: () => void;
}

function SearchForm({
  origin,
  destination,
  setOrigin,
  setDestination,
  onSwapRoute,
  onOpenLocPicker,
  selectedDate,
  setSelectedDate,
  customDate,
  onOpenDatePicker,
  seatCount,
  setSeatCount,
  searchLoading,
  onSearchRides,
}: SearchFormProps) {
  return (
    <>
      {/* Route Inputs */}
      <View style={s.routeCard}>
        {/* Origin */}
        <View style={s.routeRow}>
          <View style={s.originDot} />
          <TouchableOpacity
            style={s.routeFieldBox}
            onPress={() => onOpenLocPicker('origin')}
            activeOpacity={0.7}
          >
            <Text style={s.routeFieldLabel}>FROM</Text>
            <Text style={origin ? s.routeFieldValue : s.routeFieldPlaceholder}>
              {origin || 'Pickup point'}
            </Text>
          </TouchableOpacity>
          {origin.length > 0 && (
            <TouchableOpacity onPress={() => setOrigin('')} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={16} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>

        {/* Swap button */}
        <View style={s.swapRow}>
          <View style={s.routeDividerLine} />
          <TouchableOpacity style={s.swapBtn} activeOpacity={0.7} onPress={onSwapRoute}>
            <MaterialIcons name="swap-vert" size={20} color="#F37021" />
          </TouchableOpacity>
        </View>

        {/* Destination */}
        <View style={s.routeRow}>
          <View style={s.destDot} />
          <TouchableOpacity
            style={s.routeFieldBox}
            onPress={() => onOpenLocPicker('destination')}
            activeOpacity={0.7}
          >
            <Text style={s.routeFieldLabel}>TO</Text>
            <Text style={destination ? s.routeFieldValue : s.routeFieldPlaceholder}>
              {destination || 'Where to?'}
            </Text>
          </TouchableOpacity>
          {destination.length > 0 && (
            <TouchableOpacity onPress={() => setDestination('')} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={16} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Origin Quick Select */}
      <Text style={s.sectionLabel}>Pickup Points:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.quickSelectScroll}
      >
        {QUICK_ORIGINS.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={[s.quickChip, origin === q.label && s.quickChipActive]}
            onPress={() => setOrigin(q.label)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={q.icon}
              size={14}
              color={origin === q.label ? '#fff' : '#555'}
            />
            <Text style={[s.quickChipText, origin === q.label && s.quickChipTextActive]}>
              {q.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Destination Quick Select */}
      <Text style={s.sectionLabel}>Destinations:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.quickSelectScroll}
      >
        {QUICK_DESTINATIONS.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={[s.quickChip, destination === q.label && s.quickChipActive]}
            onPress={() => setDestination(q.label)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={q.icon}
              size={14}
              color={destination === q.label ? '#fff' : '#555'}
            />
            <Text style={[s.quickChipText, destination === q.label && s.quickChipTextActive]}>
              {q.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.dateSelectorScroll}
        style={{ marginBottom: 16 }}
      >
        {DATE_OPTIONS.map((d) => {
          const isPickWithDate = d.id === 'pick' && customDate;
          const chipLabel = isPickWithDate
            ? customDate!.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : d.label;
          return (
            <TouchableOpacity
              key={d.id}
              style={[s.dateChip, selectedDate === d.id && s.dateChipActive]}
              onPress={() => {
                if (d.id === 'pick') {
                  onOpenDatePicker();
                } else {
                  setSelectedDate(d.id);
                }
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={d.id === 'pick' ? 'calendar-today' : 'event'}
                size={14}
                color={selectedDate === d.id ? '#fff' : '#F37021'}
              />
              <Text style={[s.dateChipText, selectedDate === d.id && s.dateChipTextActive]}>
                {chipLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Seats row */}
      <View style={[s.filterRow, { paddingLeft: 16 }]}>
        <View style={s.seatStepper}>
          <TouchableOpacity
            style={s.stepperBtn}
            onPress={() => setSeatCount(Math.max(1, seatCount - 1))}
            activeOpacity={0.7}
          >
            <MaterialIcons name="remove" size={16} color={seatCount <= 1 ? '#ddd' : '#333'} />
          </TouchableOpacity>
          <View style={s.stepperValueWrap}>
            <MaterialIcons name="person" size={14} color="#555" />
            <Text style={s.stepperValue}>{seatCount} Seat{seatCount > 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity
            style={s.stepperBtn}
            onPress={() => setSeatCount(Math.min(6, seatCount + 1))}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={16} color={seatCount >= 6 ? '#ddd' : '#333'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search CTA */}
      <TouchableOpacity
        style={[
          s.searchRidesBtn,
          (!origin.trim() || !destination.trim()) && s.searchRidesBtnDisabled,
        ]}
        onPress={onSearchRides}
        activeOpacity={0.87}
        disabled={searchLoading || !origin.trim() || !destination.trim()}
      >
        {searchLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialIcons name="search" size={20} color="#fff" />
            <Text style={s.searchRidesBtnText}>Search Rides</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
}

// ─── Search Results (summary + ride list / empty state) ─────────────────────

interface SearchResultsProps {
  origin: string;
  destination: string;
  searchResults: Ride[];
  onEditSearch: () => void;
  onDismissModal: () => void;
}

function SearchResults({
  origin,
  destination,
  searchResults,
  onEditSearch,
  onDismissModal,
}: SearchResultsProps) {
  return (
    <View style={s.resultsContainer}>
      {/* Route summary pill */}
      <View style={s.resultsSummary}>
        <View style={s.resultsSummaryRoute}>
          <View style={[s.originDot, { width: 8, height: 8, borderRadius: 4, borderWidth: 2 }]} />
          <Text style={s.resultsSummaryText} numberOfLines={1}>{origin}</Text>
          <MaterialIcons name="arrow-forward" size={14} color="#bbb" />
          <View style={[s.destDot, { width: 8, height: 8, borderRadius: 2 }]} />
          <Text style={s.resultsSummaryText} numberOfLines={1}>{destination}</Text>
        </View>
        <TouchableOpacity style={s.resultsEditBtn} onPress={onEditSearch} activeOpacity={0.7}>
          <MaterialIcons name="edit" size={14} color="#F37021" />
        </TouchableOpacity>
      </View>

      {searchResults.length === 0 ? (
        <View style={s.emptyState}>
          <MaterialIcons name="search-off" size={56} color="#ddd" />
          <Text style={s.emptyStateTitle}>No rides found</Text>
          <Text style={s.emptyStateSub}>
            No active rides from {origin} to {destination} right now.
            {'\n'}Try a different date or check back later.
          </Text>
          <TouchableOpacity style={s.emptyStateBtn} onPress={onEditSearch} activeOpacity={0.8}>
            <MaterialIcons name="refresh" size={16} color="#F37021" />
            <Text style={s.emptyStateBtnText}>Modify Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RideCard ride={item} onDismissModal={onDismissModal} />}
          contentContainerStyle={s.resultsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}
