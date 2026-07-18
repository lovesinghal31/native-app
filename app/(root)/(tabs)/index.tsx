import FeaturedCard from '@/components/FeatureCard';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, []),
  );

  const fetchProperties = async () => {
    setLoading(true);

    const { data: featuredData } = await supabase
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    const { data: recommendedData } = await supabase
      .from('properties')
      .select('*')
      .eq('is_featured', false)
      .order('created_at', { ascending: false });

    setFeatured(featuredData ?? []);
    setRecommended(recommendedData ?? []);
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-6">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: '#0E4D92' }}
                >
                  <Image
                    source={require('../../../assets/images/kribb.png')}
                    style={{ width: 26, height: 26, tintColor: '#fff' }}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text className="text-gray-400 text-xs font-medium">
                    {getGreeting()} 👋
                  </Text>
                  <Text className="text-gray-900 text-lg font-bold -mt-0.5">
                    {user?.firstName ?? 'User'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="w-11 h-11 rounded-2xl bg-gray-50 items-center justify-center"
                style={{
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <Ionicons name="notifications-outline" size={20} color="#374151" />
                <View
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#F59E0B' }}
                />
              </TouchableOpacity>
            </View>

            {/* ── Search Bar ── */}
            <TouchableOpacity
              onPress={() => router.push('/(root)/(tabs)/search')}
              className="mx-5 mb-7 flex-row items-center rounded-2xl px-4 py-3.5 gap-3"
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
              <View className="flex-1">
                <Text className="text-gray-800 text-sm font-medium">
                  Search properties
                </Text>
                <Text className="text-gray-400 text-xs">
                  Cities, neighborhoods, addresses...
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push('/(root)/(tabs)/search?openFilters=true')
                }
                className="w-9 h-9 rounded-xl items-center justify-center bg-gray-100"
              >
                <Ionicons name="options-outline" size={16} color="#374151" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* ── Featured Section ── */}
            <View className="mb-7">
              <View className="flex-row items-center justify-between px-5 mb-4">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-1.5 h-6 rounded-full"
                    style={{ backgroundColor: '#F59E0B' }}
                  />
                  <Text className="text-gray-900 text-lg font-bold">
                    Featured
                  </Text>
                </View>
                <TouchableOpacity className="flex-row items-center gap-1">
                  <Text className="text-primary text-xs font-semibold">
                    See All
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#0E4D92" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#0E4D92"
                  className="py-14"
                />
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              )}
            </View>

            {/* ── Recommended Header ── */}
            <View className="flex-row items-center justify-between px-5 mb-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-1.5 h-6 rounded-full"
                  style={{ backgroundColor: '#0E4D92' }}
                />
                <Text className="text-gray-900 text-lg font-bold">
                  Recommended
                </Text>
              </View>
              <Text className="text-gray-400 text-xs font-medium">
                {recommended.length} {recommended.length === 1 ? 'listing' : 'listings'}
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
                <Ionicons name="home-outline" size={28} color="#9CA3AF" />
              </View>
              <Text className="text-gray-400 text-sm font-medium">
                No properties found
              </Text>
              <Text className="text-gray-300 text-xs mt-1">
                Check back later for new listings
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
