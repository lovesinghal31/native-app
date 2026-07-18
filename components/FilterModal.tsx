import { PropertyType, useFilterStore } from '@/store/filterStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const TYPES: { label: string; value: PropertyType; icon: string }[] = [
  { label: 'All', value: null, icon: 'apps-outline' },
  { label: 'Apartment', value: 'apartment', icon: 'business-outline' },
  { label: 'House', value: 'house', icon: 'home-outline' },
  { label: 'Villa', value: 'villa', icon: 'leaf-outline' },
  { label: 'Studio', value: 'studio', icon: 'cube-outline' },
];

const BEDS = [
  { label: 'Any', value: null },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
];

const PRICE_PRESETS = [
  { label: 'Under ₹50L', min: null, max: 5000000 },
  { label: '₹50L – ₹1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr – ₹2Cr', min: 10000000, max: 20000000 },
  { label: 'Above ₹2Cr', min: 20000000, max: null },
];

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  } = useFilterStore();

  const [localMin, setLocalMin] = useState(minPrice ? String(minPrice) : '');
  const [localMax, setLocalMax] = useState(maxPrice ? String(maxPrice) : '');

  const activeCount = [type, bedrooms, minPrice, maxPrice].filter(
    (v) => v !== null,
  ).length;

  const handleApply = () => {
    setMinPrice(localMin ? Number(localMin) : null);
    setMaxPrice(localMax ? Number(localMax) : null);
    onClose();
  };

  const handleReset = () => {
    setLocalMin('');
    setLocalMax('');
    resetFilters();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* ── Header ── */}
        <View
          className="flex-row items-center justify-between px-5 pt-6 pb-4"
          style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
        >
          <TouchableOpacity
            onPress={onClose}
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' }}
          >
            <Ionicons name="close" size={18} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#F59E0B' }}
            />
            <Text className="text-lg font-bold text-gray-900">Filters</Text>
          </View>
          <TouchableOpacity onPress={handleReset}>
            <Text className="font-semibold text-sm" style={{ color: '#0E4D92' }}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Property Type ── */}
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#0E4D92' }}
            />
            <Text className="text-base font-bold text-gray-900">
              Property Type
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {TYPES.map((item) => {
              const active = type === item.value;
              return (
                <TouchableOpacity
                  key={String(item.value)}
                  onPress={() => setType(item.value)}
                  className="flex-row items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{
                    backgroundColor: active ? '#0E4D92' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: active ? '#0E4D92' : '#E5E7EB',
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={14}
                    color={active ? '#fff' : '#6B7280'}
                  />
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: active ? '#fff' : '#4B5563' }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Bedrooms ── */}
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#0E4D92' }}
            />
            <Text className="text-base font-bold text-gray-900">
              Bedrooms
            </Text>
          </View>
          <View className="flex-row gap-2 mb-8">
            {BEDS.map((item) => {
              const active = bedrooms === item.value;
              return (
                <TouchableOpacity
                  key={String(item.value)}
                  onPress={() => setBedrooms(item.value)}
                  className="flex-1 items-center py-3.5 rounded-2xl"
                  style={{
                    backgroundColor: active ? '#0E4D92' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: active ? '#0E4D92' : '#E5E7EB',
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: active ? '#fff' : '#4B5563' }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Price Range ── */}
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#0E4D92' }}
            />
            <Text className="text-base font-bold text-gray-900">
              Price Range (₹)
            </Text>
          </View>
          <View className="flex-row gap-3 mb-4">
            {[
              {
                label: 'Min Price',
                value: localMin,
                onChange: setLocalMin,
                placeholder: '0',
              },
              {
                label: 'Max Price',
                value: localMax,
                onChange: setLocalMax,
                placeholder: 'Any',
              },
            ].map(({ label, value, onChange, placeholder }) => (
              <View key={label} className="flex-1">
                <Text className="text-xs text-gray-400 mb-1.5 font-medium">
                  {label}
                </Text>
                <View
                  className="flex-row items-center rounded-2xl px-3"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text className="text-sm mr-1" style={{ color: '#0E4D92' }}>₹</Text>
                  <TextInput
                    className="flex-1 py-3 text-gray-800 text-sm"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* ── Price Presets ── */}
          <View className="flex-row flex-wrap gap-2">
            {PRICE_PRESETS.map((p) => {
              const active = minPrice === p.min && maxPrice === p.max;
              return (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => {
                    setLocalMin(p.min ? String(p.min) : '');
                    setLocalMax(p.max ? String(p.max) : '');
                    setMinPrice(p.min);
                    setMaxPrice(p.max);
                  }}
                  className="px-3.5 py-2 rounded-full"
                  style={{
                    backgroundColor: active ? '#EFF6FF' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: active ? '#BFDBFE' : '#E5E7EB',
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: active ? '#0E4D92' : '#6B7280' }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ── Apply Button ── */}
        <View
          className="px-5 pb-8 pt-4"
          style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6' }}
        >
          <TouchableOpacity
            onPress={handleApply}
            className="rounded-2xl py-4 items-center"
            style={{
              backgroundColor: '#0E4D92',
              shadowColor: '#0E4D92',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-bold text-base">
              Apply Filters{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
