import FilterModal from '@/components/FilterModal';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { useFilterStore } from '@/store/filterStore';
import { Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === 'true') {
      setShowFilters(true);
    }
  }, [openFilters]);

  const {
    search,
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore();

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  useEffect(() => {
    fetchResults();
  }, [search, type, bedrooms, minPrice, maxPrice]);

  const fetchResults = async () => {
    setLoading(true);

    let query = supabase.from('properties').select('*');

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (bedrooms) {
      query = query.eq('bedrooms', bedrooms);
    }

    if (minPrice) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }

    const { data } = await query.order('created_at', { ascending: false });

    setResults(data ?? []);
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <View className="px-5 pt-5 pb-2">
              <Text className="text-2xl font-bold text-gray-900">
                Find Property
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Search by title, city or neighborhood
              </Text>
            </View>

            {/* ── Search Bar + Filter Button ── */}
            <View className="px-5 pt-4 pb-3 flex-row items-center gap-3">
              <View
                className="flex-1 flex-row items-center rounded-2xl px-4 gap-3"
                style={{
                  backgroundColor: '#F8FAFC',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#0E4D92' }}
                >
                  <Ionicons name="search" size={16} color="white" />
                </View>
                <TextInput
                  className="flex-1 py-3 text-gray-800 text-sm"
                  placeholder="Search by title or city..."
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Button */}
              <TouchableOpacity
                onPress={() => setShowFilters(true)}
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{
                  backgroundColor: activeFilterCount > 0 ? '#0E4D92' : '#F8FAFC',
                  borderWidth: activeFilterCount > 0 ? 0 : 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={activeFilterCount > 0 ? '#fff' : '#374151'}
                />
                {activeFilterCount > 0 && (
                  <View
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    <Text className="text-white text-[9px] font-bold">
                      {activeFilterCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Active Filter Chips ── */}
            {activeFilterCount > 0 && (
              <View className="flex-row flex-wrap gap-2 px-5 pb-3">
                {type && (
                  <View
                    className="flex-row items-center rounded-full px-3 py-1.5 gap-1.5"
                    style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                  >
                    <Ionicons name="home-outline" size={11} color="#0E4D92" />
                    <Text className="text-xs font-semibold capitalize" style={{ color: '#0E4D92' }}>
                      {type}
                    </Text>
                    <TouchableOpacity onPress={() => setType(null)}>
                      <Ionicons name="close" size={12} color="#0E4D92" />
                    </TouchableOpacity>
                  </View>
                )}
                {bedrooms !== null && (
                  <View
                    className="flex-row items-center rounded-full px-3 py-1.5 gap-1.5"
                    style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                  >
                    <Ionicons name="bed-outline" size={11} color="#0E4D92" />
                    <Text className="text-xs font-semibold" style={{ color: '#0E4D92' }}>
                      {bedrooms === 4
                        ? '4+ beds'
                        : `${bedrooms} bed${bedrooms > 1 ? 's' : ''}`}
                    </Text>
                    <TouchableOpacity onPress={() => setBedrooms(null)}>
                      <Ionicons name="close" size={12} color="#0E4D92" />
                    </TouchableOpacity>
                  </View>
                )}
                {(minPrice !== null || maxPrice !== null) && (
                  <View
                    className="flex-row items-center rounded-full px-3 py-1.5 gap-1.5"
                    style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                  >
                    <Ionicons name="cash-outline" size={11} color="#0E4D92" />
                    <Text className="text-xs font-semibold" style={{ color: '#0E4D92' }}>
                      {minPrice && maxPrice
                        ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                        : minPrice
                          ? `From ${formatPrice(minPrice)}`
                          : `Up to ${formatPrice(maxPrice!)}`}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setMinPrice(null);
                        setMaxPrice(null);
                      }}
                    >
                      <Ionicons name="close" size={12} color="#0E4D92" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ── Results Header ── */}
            <View className="flex-row items-center justify-between px-5 mb-4 mt-2">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-1.5 h-6 rounded-full"
                  style={{ backgroundColor: '#0E4D92' }}
                />
                <Text className="text-gray-900 text-lg font-bold">
                  Results
                </Text>
              </View>
              <Text className="text-gray-400 text-xs font-medium">
                {loading
                  ? 'Searching...'
                  : `${results.length} ${results.length === 1 ? 'property' : 'properties'}`}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-16">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: '#F0F4F8' }}
              >
                <Ionicons name="search-outline" size={28} color="#9CA3AF" />
              </View>
              <Text className="text-gray-400 text-sm font-medium">
                No properties found
              </Text>
              <Text className="text-gray-300 text-xs mt-1">
                Try a different search or adjust filters
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#0E4D92" className="py-20" />
          )
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
