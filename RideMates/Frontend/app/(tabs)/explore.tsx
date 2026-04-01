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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { sp } from '../../constants/responsive';
import SearchModal from '../../components/Explore/SearchModal';
import LocationPickerModal from '../../components/Explore/LocationPickerModal';
import TopIdentityBar from '../../components/Explore/TopIdentityBar';
import BottomCommandSheet from '../../components/Explore/BottomCommandSheet';
import { useAlert } from '../../components/ui/AlertContext';
import { ExploreSkeleton } from '../../components/ui/SkeletonLoader';


export default function HomeScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // FIX: Add error state for retry capability
  const [loadError, setLoadError] = useState<string | null>(null);

  // Calculate tab bar height to offset bottom sheet
  const tabBarHeight = sp(56) + (Platform.OS === 'android' ? Math.max(insets.bottom, sp(8)) : sp(8));

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
  // FIX: Track search errors for retry
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchView, setSearchView] = useState<'form' | 'results'>('form');

  // Location picker state
  const [locPickerTarget, setLocPickerTarget] = useState<'origin' | 'destination' | null>(null);
  const [locQuery, setLocQuery] = useState('');

  // Date picker state
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Bottom sheet animation: collapsed = 200, expanded = 290
  const sheetHeight = useRef(new Animated.Value(200)).current;
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const loadData = async () => {
    setLoadError(null);
    try {
      console.log('📱 Loading user profile...');
      const res = await api.get('/auth/profile');
      console.log('✅ Profile loaded:', res.data.data?.full_name);
      setProfile(res.data.data);
    } catch (error: any) {
      console.error('❌ Profile load error:', error?.response?.status, error?.message);
      if (error.response?.status === 401) {
        await deleteToken();
        router.replace('/(tabs)' as any);
      } else {
        // FIX: Set error state for retry UI
        setProfile(null);
        setLoadError(error.response?.data?.message || 'Could not load profile. Please check your connection.');
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
    const toValue = sheetExpanded ? 200 : 290;
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
    setSearchError(null);
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
        setSearchError(res.data.message || 'Search failed. Please try again.');
        showAlert({ type: 'error', title: 'Search failed', message: res.data.message || 'Please try again.' });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Network error. Please check your connection.';
      setSearchError(msg);
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

  // FIX: Add error state UI with retry button
  if (loadError) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <MaterialIcons name="wifi-off" size={64} color="#ddd" />
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16, textAlign: 'center' }}>
          Connection Error
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' }}>
          {loadError}
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row', alignItems: 'center', backgroundColor: '#C24E00',
            paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24,
          }}
          onPress={() => { setLoading(true); loadData(); }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="refresh" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
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
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={LPU_REGION}
        showsUserLocation={false}
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
        tabBarHeight={tabBarHeight}
      />
    </View>
  );
}
