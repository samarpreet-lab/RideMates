import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  Animated,
  BackHandler,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import api, { deleteToken } from '../../services/api';

// -- Explore sub-components --------------------------------------------------
import {
  Ride,
  UserProfile,
  LPU_REGION,
  LPU_LANDMARKS,
  getDateString,
  getTrustColor,
} from '../../components/Explore/constants';
import { s } from '../../components/Explore/styles';
import SearchModal from '../../components/Explore/SearchModal';
import LocationPickerModal from '../../components/Explore/LocationPickerModal';
import TopIdentityBar from '../../components/Explore/TopIdentityBar';
import BottomCommandSheet from '../../components/Explore/BottomCommandSheet';
import { useAlert } from '../../components/ui/AlertContext';
import { ExploreSkeleton } from '../../components/ui/SkeletonLoader';


export default function HomeScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Search modal state
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [origin, setOrigin] = useState('LPU Main Gate');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [seatCount, setSeatCount] = useState(1);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Search results state
  const [searchResults, setSearchResults] = useState<Ride[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchView, setSearchView] = useState<'form' | 'results'>('form');

  // Location picker state
  const [locPickerTarget, setLocPickerTarget] = useState<'origin' | 'destination' | null>(null);
  const [locQuery, setLocQuery] = useState('');

  // Date picker state
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Bottom sheet animation: collapsed = 240, expanded = 440
  const sheetHeight = useRef(new Animated.Value(240)).current;
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        await deleteToken();
        router.replace('/(tabs)' as any);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();

      // Prevent Android back button from navigating to signup/login
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp();
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  const toggleSheet = () => {
    const toValue = sheetExpanded ? 240 : 320;
    Animated.spring(sheetHeight, {
      toValue,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
    setSheetExpanded(!sheetExpanded);
  };

  const openSearchModal = () => {
    setOrigin('LPU Main Gate');
    setDestination('');
    setSelectedDate('today');
    setSeatCount(1);
    setEmergencyOnly(false);
    setSearchResults([]);
    setSearchView('form');
    setSearchModalVisible(true);
  };

  const handleSwapRoute = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearchRides = async () => {
    if (!origin.trim()) {
      showAlert({ type: 'warning', title: 'Missing origin', message: 'Please enter or select a pickup point.' });
      return;
    }
    if (!destination.trim()) {
      showAlert({ type: 'warning', title: 'Missing destination', message: 'Please enter or select a destination.' });
      return;
    }

    setSearchLoading(true);
    try {
      const params: Record<string, string> = {
        origin: origin.trim(),
        destination: destination.trim(),
      };

      const dateStr = getDateString(selectedDate, customDate ?? undefined);
      if (dateStr) params.date = dateStr;
      if (emergencyOnly) params.emergency_only = 'true';

      const res = await api.get('/rides/search', { params });

      if (res.data.success) {
        // Filter by available seats client-side (API already filters > 0)
        const filtered = (res.data.data as Ride[]).filter(
          (r) => r.available_seats >= seatCount
        );
        setSearchResults(filtered);
        setSearchView('results');
      } else {
        showAlert({ type: 'error', title: 'Search failed', message: res.data.message || 'Please try again.' });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Network error. Please check your connection.';
      showAlert({ type: 'error', title: 'Search Error', message: msg });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    showAlert({
      type: 'confirm',
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteToken();
        router.replace('/(tabs)' as any);
      },
    });
  };


  // -- Loading state ---------------------------------------------------------
  if (loading) {
    return <ExploreSkeleton />;
  }

  const isFaculty = profile?.role === 'faculty';
  const trustScore = profile?.trust_score ?? 100;
  const trustColor = getTrustColor(trustScore);



  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* -- Search Modal -------------------------------------------------- */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        origin={origin}
        destination={destination}
        setOrigin={setOrigin}
        setDestination={setDestination}
        onSwapRoute={handleSwapRoute}
        onOpenLocPicker={(target) => {
          setLocQuery(target === 'origin' ? origin : destination);
          setLocPickerTarget(target);
        }}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        customDate={customDate}
        onOpenDatePicker={() => setShowDatePicker(true)}
        seatCount={seatCount}
        setSeatCount={setSeatCount}
        searchLoading={searchLoading}
        onSearchRides={handleSearchRides}
        searchView={searchView}
        setSearchView={setSearchView}
        searchResults={searchResults}
      />

      {/* -- Location Picker ----------------------------------------------- */}
      <LocationPickerModal
        visible={locPickerTarget !== null}
        target={locPickerTarget}
        query={locQuery}
        setQuery={setLocQuery}
        onSelect={(label) => {
          if (locPickerTarget === 'origin') setOrigin(label);
          else setDestination(label);
          setLocPickerTarget(null);
          setLocQuery('');
        }}
        onClose={() => {
          setLocPickerTarget(null);
          setLocQuery('');
        }}
      />

      {/* Native date picker */}
      {showDatePicker && (
        <DateTimePicker
          value={customDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          maximumDate={(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d; })()}
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setShowDatePicker(false);
            if (event.type === 'set' && date) {
              setCustomDate(date);
              setSelectedDate('pick');
            }
          }}
        />
      )}

      {/* -- Full-Screen Map ---------------------------------------------- */}
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={LPU_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapType="standard"
      >
        {LPU_LANDMARKS.map((lm) => (
          <Marker
            key={lm.id}
            coordinate={{ latitude: lm.lat, longitude: lm.lon }}
            title={lm.title}
          >
            <View style={[s.markerBubble, { backgroundColor: lm.color }]}>
              <MaterialIcons name={lm.icon} size={14} color="#fff" />
            </View>
            <View style={[s.markerTail, { borderTopColor: lm.color }]} />
          </Marker>
        ))}
      </MapView>

      {/* -- Top Identity Bar --------------------------------------------- */}
      <TopIdentityBar
        profile={profile}
        trustScore={trustScore}
        trustColor={trustColor}
        isFaculty={isFaculty}
      />

      {/* -- Bottom Command Sheet ----------------------------------------- */}
      <BottomCommandSheet
        profile={profile}
        trustScore={trustScore}
        trustColor={trustColor}
        sheetHeight={sheetHeight}
        sheetExpanded={sheetExpanded}
        toggleSheet={toggleSheet}
        openSearchModal={openSearchModal}
        handleLogout={handleLogout}
        router={router}
      />
    </View>
  );
}
