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
    Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import MyRideCard from '../../components/MyRides/MyRideCard';
import { s } from '../../components/MyRides/styles';
import { useAlert } from '../../components/ui/AlertContext';
import { MyRidesSkeleton } from '../../components/ui/SkeletonLoader';
import RideStatusModal from '../../components/ui/RideStatusModal';
import ReportModal from '../../components/ui/ReportModal';

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
    const [statusModal, setStatusModal] = useState<any>(null);

    // Report Modal State
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportRideId, setReportRideId] = useState<number>(0);
    const [reportedUserId, setReportedUserId] = useState<number>(0);
    const [reportedUserName, setReportedUserName] = useState<string>('');

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
            // FIX: Wrap both API calls in catch to prevent Promise.all crash
            const [res, profileRes] = await Promise.all([
                api.get('/rides/my').catch((err) => ({ 
                    data: { success: false, message: err.response?.data?.message || 'Failed to load rides.' } 
                })),
                api.get('/auth/profile').catch(() => ({ data: { success: false, data: null } }))
            ]);
            
            if (res.data.success) {
                setBookedRides(res.data.data.as_passenger || []);
                setPublishedRides(res.data.data.as_driver || []);
            } else {
                setErrorLine(res.data.message || 'Could not fetch rides.');
            }



            // Check for rides that need completion prompts (driver only, > 2h past departure)
            if (res.data.success && res.data.data.as_driver) {
                checkCompletionPrompts(res.data.data.as_driver);
            }
        } catch (error: any) {
            console.error('Error fetching my rides:', error);
            setErrorLine(error.response?.data?.message || 'Network error fetching rides.');
        } finally {
            setLoading(false);
        }
    };

    const checkCompletionPrompts = async (driverRides: any[]) => {
        try {
            const now = new Date();
            for (const ride of driverRides) {
                if (ride.status === 'active') {
                    const departure = new Date(ride.departure_time);
                    const hoursSinceDeparture = (now.getTime() - departure.getTime()) / (1000 * 60 * 60);
                    
                    if (hoursSinceDeparture >= 2) {
                        const promptKey = `@completion_prompt_${ride.id}`;
                        const hasPrompted = await AsyncStorage.getItem(promptKey);

                        if (!hasPrompted) {
                            // Only prompt once
                            await AsyncStorage.setItem(promptKey, 'true');
                            
                            setStatusModal({
                                visible: true,
                                type: 'success',
                                iconName: 'check-circle-outline',
                                title: 'Ride Completed?',
                                message: `It looks like your ride to ${ride.destination_city} has finished.\n\nWould you like to mark it as completed now?`,
                                pillText: 'ACTION REQUIRED',
                                primaryLabel: 'Mark Completed',
                                primaryIcon: 'check',
                                onPrimaryPress: () => {
                                    setStatusModal(null);
                                    handleCompleteRide(ride.id);
                                },
                                secondaryLabel: 'Not Yet',
                                onSecondaryPress: () => setStatusModal(null),
                            });
                            
                            // Break after showing one prompt so we don't bombard the user
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error checking completion prompts', e);
        }
    };

    const handleCompleteRide = async (rideId: number) => {
        try {
            const res = await api.put(`/rides/${rideId}/complete`);
            if (res.data.success) {
                showAlert({ type: 'success', title: 'Ride Completed', message: res.data.message });
                fetchMyRides();
            } else {
                showAlert({ type: 'error', title: 'Error', message: res.data.message || 'Could not complete ride.' });
            }
        } catch (error: any) {
            showAlert({ type: 'error', title: 'Error', message: error.response?.data?.message || 'Failed to complete ride.' });
        }
    };

    const handlePromptCancelBooking = (bookingId: number, penaltyWarning: string, ride: any) => {
        setStatusModal({
            visible: true,
            type: 'warning',
            iconName: 'alert-circle',
            title: 'Cancel Booking?',
            message: `Are you sure you want to cancel your booking for ${ride.origin_city} → ${ride.destination_city}?\n\n${penaltyWarning}\n\nCancellation Policy:\n• > 4 hours before: No penalty\n• 30m - 4 hours before: −2 Trust Points\n• < 30m or after: −5 Trust Points`,
            pillText: 'WARNING',
            primaryLabel: 'Cancel Booking',
            primaryIcon: 'cancel',
            onPrimaryPress: () => {
                setStatusModal(null);
                setTimeout(() => handleCancelBooking(bookingId, ride), 300);
            },
            secondaryLabel: 'Keep Booking',
            onSecondaryPress: () => setStatusModal(null),
        });
    };

    const handleCancelBooking = async (bookingId: number, ride?: any) => {
        try {
            const res = await api.put(`/bookings/${bookingId}/cancel`);
            if (res.data.success) {
                const { penalty, tier } = res.data.data;
                let msg = res.data.message;
                if (penalty > 0) {
                    msg += `\n\nPenalty: −${penalty} Trust Points (${tier})`;
                }
                setStatusModal({
                    visible: true,
                    type: penalty > 0 ? 'warning' : 'success',
                    iconName: 'cancel',
                    title: 'Booking Cancelled',
                    message: msg,
                    pillText: 'CANCELLATION CONFIRMED',
                    primaryLabel: 'Got it',
                    primaryIcon: 'check',
                    onPrimaryPress: () => setStatusModal(null),
                });
                
                if (ride && ride.driver_phone) {
                    const msg =
                        `Hi ${ride.driver_name || 'Driver'}! Sorry, I just had to cancel my booking ` +
                        `for your *${ride.origin_city}* → *${ride.destination_city}* ride on RideMates. ` +
                        `You can open up that seat for someone else. 🙏`;
                    
                    const cleaned = ride.driver_phone.replace(/\D/g, '');
                    const finalPhone = cleaned.length === 10 ? `91${cleaned}` : cleaned;
                    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
                    Linking.canOpenURL(url).then(can => {
                        if (can) Linking.openURL(url).catch(() => {});
                    }).catch(() => {});
                }

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
                    {/* FIX: Add retry button on error state */}
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row', alignItems: 'center', backgroundColor: '#C24E00',
                            paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16,
                        }}
                        onPress={fetchMyRides}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="refresh" size={18} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>Retry</Text>
                    </TouchableOpacity>
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
                            onCancelBooking={(id) => handleCancelBooking(id, item)}
                            onPromptCancel={handlePromptCancelBooking}
                            onReport={(ride) => {
                                setReportRideId(ride.id);
                                // If I'm a passenger, I report the driver. If I'm a driver, I report the passenger.
                                // NOTE: For driver reporting passenger, we'd need multiple selections in the future,
                                // but for MVP, we just use the first booked user if not defined.
                                // Actually, MyRides shows passenger rides. The reported user depends on viewMode.
                                if (activeTab === 'booked') {
                                    setReportedUserId(ride.driver_id);
                                    setReportedUserName(ride.driver_name);
                                } else {
                                    // For published rides, we might not have a single passenger id.
                                    // Let's just use the first booking's user for now or prompt.
                                    // Since backend isn't sending passenger lists here, we'll just guard it.
                                    if (ride.passenger_id) {
                                        setReportedUserId(ride.passenger_id);
                                        setReportedUserName(ride.passenger_name || 'Passenger');
                                    } else {
                                        showAlert({ type: 'warning', title: 'Cannot Report', message: 'Passenger reporting from this screen requires navigating to passenger list.'});
                                        return;
                                    }
                                }
                                setReportModalVisible(true);
                            }}
                        />
                    )}
                />
            )}

            <RideStatusModal
                visible={statusModal?.visible || false}
                type={statusModal?.type || 'success'}
                iconName={statusModal?.iconName || 'shield-check'}
                title={statusModal?.title || ''}
                message={statusModal?.message || ''}
                pillText={statusModal?.pillText}
                primaryAction={{
                    label: statusModal?.primaryLabel || 'Done',
                    icon: statusModal?.primaryIcon,
                    onPress: statusModal?.onPrimaryPress || (() => setStatusModal(null))
                }}
                secondaryAction={statusModal?.secondaryLabel ? {
                    label: statusModal.secondaryLabel,
                    onPress: statusModal.onSecondaryPress || (() => setStatusModal(null))
                } : undefined}
            />

            <ReportModal
                visible={reportModalVisible}
                rideId={reportRideId}
                reportedUserId={reportedUserId}
                reportedUserName={reportedUserName}
                onClose={() => setReportModalVisible(false)}
                onSuccess={() => setReportModalVisible(false)}
            />
        </View>
    );
}
