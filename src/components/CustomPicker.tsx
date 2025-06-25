// src/components/CustomPicker.tsx

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

interface PickerItem {
  label: string;
  value: string | number;
}

interface PickerProps {
  label?: string;
  selectedValue: string | number | null;
  onValueChange: (itemValue: string | number) => void;
  items: PickerItem[];
  placeholder?: string;
  enabled?: boolean;
}

const ITEM_HEIGHT = 48;
const screenHeight = Dimensions.get('window').height;

export default function CustomPicker({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = 'Vui lòng chọn...',
  enabled = true,
}: PickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [layout, setLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const pickerRef = useRef<View>(null); // Khai báo ref với kiểu View

  const togglePicker = () => {
    if (isVisible) {
      setIsVisible(false);
    } else {
      pickerRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
        setLayout({ x, y, width, height });
        setIsVisible(true);
      });
    }
  };

  const selectedItem = items.find(item => item.value === selectedValue);

  return (
    <View style={styles.outerContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      {/* SỬA Ở ĐÂY: Xóa đoạn ép kiểu "as React.Ref<TouchableOpacity>" */}
      <TouchableOpacity
        ref={pickerRef}
        style={[styles.pickerButton, !enabled && styles.disabled]}
        onPress={() => enabled && togglePicker()}
        disabled={!enabled}
      >
        <Text style={[styles.pickerText, !selectedItem && styles.placeholderText]} numberOfLines={1}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Text style={styles.iconText}>{isVisible ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal transparent visible={isVisible} onRequestClose={() => setIsVisible(false)} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            {layout && (
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      top: layout.y + layout.height + 2,
                      left: layout.x,
                      width: layout.width,
                      maxHeight: Math.min(ITEM_HEIGHT * 5, screenHeight - layout.y - layout.height - 20),
                    },
                  ]}
                >
                  <FlatList
                    data={items}
                    keyExtractor={item => item.value.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          onValueChange(item.value);
                          setIsVisible(false);
                        }}
                      >
                        <Text>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { marginBottom: 16 },
  label: { color: '#6B7280', fontSize: 12, marginBottom: 4, fontWeight: '500' },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    height: 48,
    paddingHorizontal: 12,
  },
  pickerText: { fontSize: 16 },
  placeholderText: { color: '#9CA3AF' },
  disabled: { backgroundColor: '#E5E7EB', opacity: 0.7 },
  iconText: { fontSize: 12, color: '#6B7280' },
  modalOverlay: { flex: 1 },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});