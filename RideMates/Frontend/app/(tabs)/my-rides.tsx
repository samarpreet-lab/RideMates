// =============================================================================
// app/(tabs)/my-rides.tsx — My Rides History Screen
// =============================================================================
// Displays all rides the user has booked (as passenger) and published (as driver).
// =============================================================================

import React, { useCallback, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import MyRideCard from '../../components/MyRides/MyRideCard';
import { s } from '../../components/MyRides/styles';
import { useAlert } from '../../components/ui/AlertContext';
import { MyRidesSkeleton } from '../../components/ui/SkeletonLoader';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 2;

type TabOption = 'booked' | 'published';

export default function MyRidesScreen() {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabOption>('booked');
    const [bookedRides, setBookedRides] = useState<any[]>([]);
    const [publishedRides, setPublishedRides] = useState<any[]>([]);
    const [errorLine, setErrorLine] = useState('');

    // Animation value for the sliding underline
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Re-fetch every time the screen comes into focus (e.g. after posting a ride)
    useFocusEffect(
        useCallback(() => {
            fetchMyRides();
        }, [])
    );

    const fetchMyRides = async () => {
        setLoading(true);
        setErrorLine('');
        try {
            const res = await api.get('/rides/my');
            if (res.data.success) {
                setBookedRides(res.data.data.as_passenger || []);
                setPublishedRides(res.data.data.as_driver || []);
            } else {
                setErrorLine(res.data.message || 'Could not fetch rides.');
            }
        } catch (error: any) {
            console.error('Error fetching my rides:', error);
            setErrorLine(error.response?.data?.message || 'Network error fetching rides.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        try {
            const res = await api.put(`/bookings/${bookingId}/cancel`);
            if (res.data.success) {
                const { penalty, tier } = res.data.data;
                let msg = res.data.message;
                if (penalty > 0) {
                    msg += `\n\nPenalty: −${penalty} Trust Points (${tier})`;
                }
                showAlert({ type: 'success', title: 'Booking Cancelled', message: msg });
                fetchMyRides();
            } else {
                showAlert({ type: 'error', title: 'Error', message: res.data.message || 'Could not cancel booking.' });
            }
        } catch (error: any) {
            showAlert({ type: 'error', title: 'Error', message: error.response?.data?.message || 'Something went wrong.' });
        }
    };

    // Animate tab indicator
    const handleTabSwitch = (tab: TabOption) => {
        setActiveTab(tab);
        Animated.spring(slideAnim, {
            toValue: tab === 'booked' ? 0 : TAB_WIDTH,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    };

    const renderEmptyState = () => (
        <View style={s.centerContainer}>
            <MaterialIcons
                name={activeTab === 'booked' ? 'directions-car' : 'add-road'}
                size={48}
                color="#ddd"
            />
            <Text style={s.emptyTitle}>
                No {activeTab === 'booked' ? 'Bookings' : 'Published Rides'} yet
            </Text>
            <Text style={s.emptySub}>
                {activeTab === 'booked'
                    ? "You haven't booked any rides as a passenger yet. Explore to find rides!"
                    : "You haven't posted any rides as a driver. Tap Post Ride to get started."}
            </Text>
        </View>
    );

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>My Rides</Text>
            </View>

            {/* Sliding Tabs */}
            <View style={s.tabRow}>
                <TouchableOpacity
                    style={s.tabBtn}
                    activeOpacity={0.7}
                    onPress={() => handleTabSwitch('booked')}
                >
                    <View style={s.tabTextContainer}>
                        <MaterialIcons
                            name="history"
                            size={18}
                            color={activeTab === 'booked' ? '#C24E00' : '#888'}
                        />
                        <Text style={[s.tabText, activeTab === 'booked' && s.tabTextActive]}>
                            Booked
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={s.tabBtn}
                    activeOpacity={0.7}
                    onPress={() => handleTabSwitch('published')}
                >
                    <View style={s.tabTextContainer}>
                        <MaterialIcons
                            name="drive-eta"
                            size={18}
                            color={activeTab === 'published' ? '#C24E00' : '#888'}
                        />
                        <Text style={[s.tabText, activeTab === 'published' && s.tabTextActive]}>
                            Published
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Animated Slide Indicator */}
                <Animated.View
                    style={[
                        s.activeIndicator,
                        { width: TAB_WIDTH, transform: [{ translateX: slideAnim }] },
                    ]}
                />
            </View>

            {/* Content Area */}
            {loading ? (
                <MyRidesSkeleton />
            ) : errorLine ? (
                <View style={s.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#f87171" />
                    <Text style={s.emptyTitle}>Oops!</Text>
                    <Text style={s.emptySub}>{errorLine}</Text>
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'booked' ? bookedRides : publishedRides}
                    keyExtractor={(item) => item.id.toString() + (item.booking_status || '')}
                    contentContainerStyle={s.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    ItemSeparatorComponent={() => <View style={s.listGap} />}
                    renderItem={({ item }) => (
                        <MyRideCard
                            ride={item}
                            viewMode={activeTab === 'booked' ? 'passenger' : 'driver'}
                            onCancelBooking={handleCancelBooking}
                        />
                    )}
                />
            )}
        </View>
    );
}
