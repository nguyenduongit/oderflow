// src/screens/(dashboard)/DashboardScreen.tsx
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, Alert, View, Text, ActivityIndicator, useWindowDimensions, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useSubscription } from '@/hooks/useSubscription';
import CreateRestaurantForm from '@/features/restaurants/CreateRestaurantForm';
import { getTablesWithStatus } from '@/services/apiOrders';
import { createTable } from '@/services/apiTables';
import type { TableWithStatus } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';

// --- Types & Constants ---
type UncreatedTable = {
    id?: undefined;
    status: 'uncreated';
    table_number: number;
};
type GridItem = TableWithStatus | UncreatedTable;

const SPACING = 10;

// --- Components ---

// THAY ĐỔI Ở ĐÂY: Thêm prop `style` để nhận kích thước từ FlatList
const TableCard = ({ item, onAdd, isAdding, style }: { item: GridItem, onAdd: (tableNumber: number) => void, isAdding: boolean, style: any }) => {
    const isCreated = !!item.id;

    if (!isCreated) {
        return (
            <View style={style}>
                <Card style={[styles.cardBase, styles.cardUncreated]}>
                    <Text style={styles.tableNumberUncreated}>Bàn {item.table_number}</Text>
                    <Button
                        title="Thêm"
                        onPress={() => onAdd(item.table_number)}
                        isLoading={isAdding}
                        style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}
                        textStyle={{ fontSize: 13, fontWeight: '600' }}
                    />
                </Card>
            </View>
        );
    }

    const isOccupied = item.status === 'occupied';
    const cardStyle = isOccupied ? styles.cardOccupied : styles.cardVacant;
    const textStyle = isOccupied ? styles.textOccupied : styles.textVacant;

    return (
        <TouchableOpacity style={style}>
            <Card style={[styles.cardBase, cardStyle]}>
                <Text style={[styles.tableNumber, textStyle]}>Bàn {item.table_number}</Text>
                <Text style={[styles.statusText, textStyle]}>
                    {isOccupied ? 'Có khách' : 'Trống'}
                </Text>
            </Card>
        </TouchableOpacity>
    );
};

export default function DashboardScreen() {
    const queryClient = useQueryClient();
    const { restaurant, isLoading: isLoadingRestaurant } = useRestaurant();
    const { subscription, isLoading: isLoadingSubscription } = useSubscription();

    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const numColumns = isLandscape ? 8 : 4;

    // --- THAY ĐỔI Ở ĐÂY: Tính toán kích thước ô một cách chính xác ---
    // Tổng padding ngang của container (10 bên trái, 10 bên phải)
    const totalHorizontalPadding = SPACING * 2;
    // Tổng khoảng cách ngang giữa các ô
    const totalGapWidth = SPACING * (numColumns - 1);
    // Chiều rộng còn lại cho các ô
    const availableWidth = width - totalHorizontalPadding - totalGapWidth;
    // Kích thước của mỗi ô vuông
    const itemSize = availableWidth / numColumns;
    // ----------------------------------------------------------------

    const { data: tables, isLoading: isLoadingTables } = useQuery({
        queryKey: ['tables-status', restaurant?.id],
        queryFn: () => getTablesWithStatus(restaurant!.id),
        enabled: !!restaurant,
    });

    const { mutate: addTable, isPending: isAdding } = useMutation({
        mutationFn: (tableNumber: number) => createTable(tableNumber, restaurant!.id),
        onSuccess: () => {
          Alert.alert('Thành công', 'Đã thêm bàn mới!');
          queryClient.invalidateQueries({ queryKey: ['tables-status'] });
        },
        onError: (err: Error) => Alert.alert('Lỗi', err.message),
    });

    const isLoading = isLoadingRestaurant || isLoadingSubscription;

    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    if (!restaurant) {
        return <CreateRestaurantForm />;
    }

    const maxTables = subscription?.plans?.max_tables || 16;
    const allPossibleTables: GridItem[] = Array.from({ length: maxTables }, (_, i) => {
        const tableNumber = i + 1;
        const existingTable = tables?.find(t => t.table_number === tableNumber);
        if (existingTable) {
          return { ...existingTable, isCreated: true };
        } else {
          return { table_number: tableNumber, status: 'uncreated', isCreated: false };
        }
    });

    return (
        <SafeAreaView style={styles.container}>
             {(isLoadingTables) ? (
                <View style={styles.center}><ActivityIndicator size="large" /></View>
             ) : (
                <FlatList
                    data={allPossibleTables}
                    key={numColumns}
                    renderItem={({ item, index }) => (
                        <TableCard
                            item={item}
                            onAdd={addTable}
                            isAdding={isAdding}
                            // THAY ĐỔI Ở ĐÂY: Truyền style đã tính toán vào
                            style={{
                                width: itemSize,
                                height: itemSize,
                                // Thêm margin để tạo gap, trừ ô đầu tiên mỗi hàng
                                marginLeft: (index % numColumns === 0) ? 0 : SPACING,
                                marginBottom: SPACING,
                            }}
                        />
                    )}
                    keyExtractor={(item) => `table-${item.table_number}`}
                    numColumns={numColumns}
                    // THAY ĐỔI Ở ĐÂY: Style cho container của FlatList
                    contentContainerStyle={styles.gridContainer}
                />
             )}
        </SafeAreaView>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    // THAY ĐỔI Ở ĐÂY: Style cho container của FlatList
    gridContainer: {
        paddingHorizontal: SPACING,
        paddingTop: SPACING,
    },
    // Bỏ cardContainer, vì style đã được tính toán và truyền trực tiếp
    cardBase: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
    },
    cardUncreated: {
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    cardVacant: {
        backgroundColor: '#EFF6FF',
    },
    cardOccupied: {
        backgroundColor: '#FEFCE8',
    },
    tableNumber: {
        fontSize: 16, // Có thể điều chỉnh lại size chữ cho vừa ô nhỏ
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 12, // Có thể điều chỉnh lại size chữ
        marginTop: 4,
        fontWeight: '500'
    },
    tableNumberUncreated: {
        color: '#6B7280',
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    textVacant: {
        color: '#3B82F6',
    },
    textOccupied: {
        color: '#A16207',
    },
});