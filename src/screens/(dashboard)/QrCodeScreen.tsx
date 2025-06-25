// src/screens/(dashboard)/QrCodeScreen.tsx
import React, { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, useWindowDimensions, SafeAreaView, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { QrCode, CheckCircle, Circle, X } from 'lucide-react-native';

import { useRestaurant } from '@/hooks/useRestaurant';
import { getAllTables, updateTablesActivity } from '@/services/apiTables';
import Card from '@/components/Card';
import Button from '@/components/Button';
import type { QrCodeTable } from '@/types';

const SPACING = 10;
const QR_BASE_URL = "http://localhost:8081/ordering/"; 

// --- Component Card cho mỗi bàn ---
const QrCodeCard = ({ item, isSelected, showCheckbox }: {
    item: QrCodeTable;
    isSelected: boolean;
    showCheckbox: boolean;
}) => {
    const selectionStyle = isSelected ? styles.cardSelected : {};

    return (
        <View style={styles.cardContainer}>
            <Card style={[styles.cardBase, !item.is_active && styles.cardInactive, selectionStyle]}>
                <Text style={[styles.tableNumber, !item.is_active && styles.textInactive]}>
                    Bàn {item.table_number}
                </Text>
                <QrCode size={28} color={item.is_active ? "#4B5563" : "#9CA3AF"} />
                {showCheckbox && (
                    <View style={styles.checkboxOverlay}>
                        {isSelected
                            ? <CheckCircle size={24} color="#3B82F6" fill="white" />
                            : <Circle size={24} color="#9CA3AF" fill="#F9FAFB" />
                        }
                    </View>
                )}
            </Card>
        </View>
    );
};

// --- Màn hình chính ---
export default function QrCodeScreen() {
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { restaurant } = useRestaurant();
    const { width, height } = useWindowDimensions();

    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTable, setModalTable] = useState<QrCodeTable | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const isLandscape = width > height;
    const numColumns = isLandscape ? 8 : 4;

    const { data: tables = [], isLoading } = useQuery<QrCodeTable[]>({
        queryKey: ['all-tables', restaurant?.id],
        queryFn: () => getAllTables(restaurant!.id),
        enabled: !!restaurant,
    });
    
    const { mutate: updateActivity, isPending: isUpdating } = useMutation({
        mutationFn: updateTablesActivity,
        onSuccess: (_, variables) => {
            Alert.alert("Thành công", `Đã ${variables.isActive ? 'hiển thị' : 'ẩn'} các bàn đã chọn.`);
            queryClient.invalidateQueries({ queryKey: ['all-tables'] });
            queryClient.invalidateQueries({ queryKey: ['tables-status'] });
            setSelectedTableIds([]);
            setIsSelecting(false);
        },
        onError: (err: Error) => Alert.alert("Lỗi", err.message)
    });

    const handleSelect = useCallback((id: string) => {
        setSelectedTableIds(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
    }, []);

    const handleToggleSelectAll = useCallback(() => {
        if (selectedTableIds.length === tables.length) {
            setSelectedTableIds([]);
        } else {
            setSelectedTableIds(tables.map((t) => t.id));
        }
    }, [tables, selectedTableIds.length]);

    const handleCardPress = useCallback((table: QrCodeTable) => {
        if (isSelecting) {
            handleSelect(table.id);
        } else {
            setModalTable(table);
            setModalVisible(true);
        }
    }, [isSelecting, handleSelect]);

    const handleToggleSelecting = useCallback(() => {
        const nextIsSelecting = !isSelecting;
        setIsSelecting(nextIsSelecting);
        if (!nextIsSelecting) {
            setSelectedTableIds([]);
        }
    }, [isSelecting]);

    const handleHideTables = useCallback(() => {
        if (selectedTableIds.length === 0) return;
        updateActivity({ tableIds: selectedTableIds, isActive: false });
    }, [selectedTableIds, updateActivity]);

    const selectedInactiveTables = useMemo(() => {
        return tables.filter((t) => selectedTableIds.includes(t.id) && !t.is_active);
    }, [selectedTableIds, tables]);

    const handleShowTables = useCallback(() => {
        if (selectedInactiveTables.length === 0) return;
        updateActivity({ tableIds: selectedInactiveTables.map((t) => t.id), isActive: true });
    }, [selectedInactiveTables, updateActivity]);

    // --- SỬA LỖI VÀ CẬP NHẬT HEADER Ở ĐÂY ---
    useLayoutEffect(() => {
        navigation.setOptions({
            // Luôn canh giữa header title
            headerTitleAlign: 'center',
            // Dùng hàm để render title, cho phép tùy chỉnh style
            headerTitle: () => (
                <Text style={isSelecting ? styles.headerTitleSelecting : styles.headerTitleNormal}>
                    {isSelecting ? `Đã chọn ${selectedTableIds.length}` : 'Quản lý mã QR'}
                </Text>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={handleToggleSelecting} style={{ marginRight: 10 }}>
                    <Text style={{ color: '#3B82F6', fontSize: 16 }}>{isSelecting ? 'Xong' : 'Chọn'}</Text>
                </TouchableOpacity>
            ),
            headerLeft: () => (
                isSelecting ? (
                    <TouchableOpacity onPress={handleToggleSelectAll} style={{ marginLeft: 10 }}>
                        <Text style={{ color: '#3B82F6', fontSize: 16 }}>
                            {selectedTableIds.length === tables.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                        </Text>
                    </TouchableOpacity>
                ) : undefined
            ),
        });
    }, [navigation, isSelecting, selectedTableIds.length, tables.length, handleToggleSelectAll, handleToggleSelecting]);
    

    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={tables}
                key={numColumns}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.itemWrapper}
                        onPress={() => handleCardPress(item)}
                    >
                        <QrCodeCard
                            item={item}
                            isSelected={selectedTableIds.includes(item.id)}
                            showCheckbox={isSelecting}
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                contentContainerStyle={styles.gridContainer}
            />

            {isSelecting && selectedTableIds.length > 0 && (
                <View style={styles.footer}>
                    <Button title="Xuất QR" variant='secondary' onPress={() => Alert.alert("Sắp có", "Chức năng xuất file QR sẽ được phát triển.")} />
                    <View style={{flexDirection: 'row', gap: 8}}>
                        {selectedInactiveTables.length > 0 && <Button title={`Hiện (${selectedInactiveTables.length})`} onPress={handleShowTables} isLoading={isUpdating} />}
                        <Button title="Ẩn bàn" variant='danger' onPress={handleHideTables} isLoading={isUpdating} />
                    </View>
                </View>
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Mã QR - Bàn {modalTable?.table_number}</Text>
                        {modalTable && <QRCode value={`${QR_BASE_URL}${modalTable.id}`} size={250} />}
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gridContainer: { padding: SPACING },
    itemWrapper: {
        flex: 1 / 4,
        aspectRatio: 1,
        padding: SPACING / 2,
    },
    cardContainer: {
        flex: 1,
    },
    cardBase: {
        flex: 1,
        justifyContent: 'center', alignItems: 'center',
        padding: 8, borderRadius: 16,
        position: 'relative',
        overflow: 'hidden'
    },
    cardSelected: {
        borderWidth: 3,
        borderColor: '#3B82F6',
    },
    cardInactive: { backgroundColor: '#E5E7EB' },
    tableNumber: { fontSize: 14, fontWeight: 'bold', position: 'absolute', top: 8 },
    textInactive: { color: '#9CA3AF' },
    checkboxOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 2
    },
    footer: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 16,
        borderTopWidth: 1, borderTopColor: '#E5E7EB',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingBottom: 30,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 16, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    closeButton: {
        position: 'absolute', top: -15, right: -15,
        backgroundColor: '#374151', borderRadius: 20,
        width: 40, height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // THÊM CÁC STYLE MỚI CHO HEADER
    headerTitleNormal: {
        fontSize: 17,
        fontWeight: '600',
    },
    headerTitleSelecting: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#4B5563',
    },
});