// src/screens/(dashboard)/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '@/navigation/SettingsStackNavigator'; // Sẽ tạo ở bước sau
import { ChevronRight } from 'lucide-react-native';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsList'>;

const SettingsItem = ({ label, onPress }: { label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <Text style={styles.itemLabel}>{label}</Text>
        <ChevronRight color="#6B7280" />
    </TouchableOpacity>
);

export default function SettingsScreen() {
    const navigation = useNavigation<SettingsScreenNavigationProp>();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cài đặt</Text>
            </View>
            <View style={styles.container}>
                <SettingsItem label="Thông tin quán" onPress={() => navigation.navigate('RestaurantInfo')} />
                <SettingsItem label="Quản lý mã QR" onPress={() => navigation.navigate('QrCode')} />
                <SettingsItem label="Gói đăng ký & Thanh toán" onPress={() => navigation.navigate('Subscription')} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { paddingTop: 16 },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: 'white' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    itemContainer: {
        backgroundColor: 'white',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemLabel: { fontSize: 16 },
});