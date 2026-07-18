import { useSavedProperty } from '@/hooks/useSavedProperty';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import { Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');
const ADMIN_PHONE = '919999999999'; // replace with your WhatsApp number

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isAdmin = useUserStore((state) => state.isAdmin);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? '');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error(error);
        Alert.alert('Error', error.message);
        return;
      }

      setProperty(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load property.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Property', 'Are you sure?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('properties')
              .delete()
              .eq('id', id);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            router.replace('/(root)/(tabs)');
          } catch {
            Alert.alert('Error', 'Unable to delete property.');
          }
        },
      },
    ]);
  };

  const handleMarkSold = () => {
    Alert.alert('Mark as Sold', 'Are you sure?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Mark Sold',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('properties')
              .update({
                is_sold: true,
              })
              .eq('id', id);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            setProperty((prev) =>
              prev
                ? {
                    ...prev,
                    is_sold: true,
                  }
                : prev,
            );
          } catch {
            Alert.alert('Error', 'Unable to update property.');
          }
        },
      },
    ]);
  };

  const handleContact = () => {
    const message = `Hi! I'm interested in the property: ${property?.title}`;
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(
      message,
    )}`;
    Linking.openURL(url);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0E4D92" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: '#F0F4F8' }}
        >
          <Ionicons name="home-outline" size={28} color="#9CA3AF" />
        </View>
        <Text className="text-gray-400 text-sm font-medium">
          Property not found
        </Text>
      </View>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    property.longitude - 0.003
  }%2C${property.latitude - 0.003}%2C${property.longitude + 0.003}%2C${
    property.latitude + 0.003
  }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`;

  const isLongDesc = (property.description?.length ?? 0) > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? property.description
      : property.description?.slice(0, 150) + '...';

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Image Carousel ── */}
        <View>
          <View>
            <FlatList
              data={property.images}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                  <Image
                    source={{ uri: item }}
                    style={{ width, height: 320 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            />

            {/* Bottom gradient overlay for dots */}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%' }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.0)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.20)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} />
            </View>

            {/* Sold overlay */}
            {property.is_sold && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.40)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    backgroundColor: '#EF4444',
                    paddingHorizontal: 40,
                    paddingVertical: 10,
                    transform: [{ rotate: '-15deg' }],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 22,
                      fontWeight: '900',
                      letterSpacing: 6,
                      textTransform: 'uppercase',
                    }}
                  >
                    SOLD
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Image count badge */}
          <View
            className="absolute bottom-3 right-4 px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <Ionicons name="images-outline" size={11} color="#fff" />
            <Text className="text-white text-xs font-semibold">
              {activeIndex + 1}/{property.images.length}
            </Text>
          </View>

          {/* Dot indicators */}
          {property.images.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
              {property.images.map((_, i) => (
                <View
                  key={i}
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: i === activeIndex ? 20 : 6,
                    backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                  }}
                />
              ))}
            </View>
          )}

          {/* Back + Save buttons */}
          <SafeAreaView className="absolute top-0 left-0 right-0">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons name="arrow-back" size={18} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleSave}
                disabled={saveLoading}
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isSaved ? '#EF4444' : '#374151'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ── Content ── */}
        <View className="px-5 pt-5 pb-8">
          {/* Badges */}
          <View className="flex-row gap-2 mb-4 flex-wrap">
            <View
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
            >
              <Ionicons name="home-outline" size={11} color="#0E4D92" />
              <Text className="text-xs font-semibold capitalize" style={{ color: '#0E4D92' }}>
                {property.type}
              </Text>
            </View>
            {property.is_featured && (
              <View
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }}
              >
                <Ionicons name="star" size={11} color="#D97706" />
                <Text className="text-xs font-semibold" style={{ color: '#D97706' }}>
                  Featured
                </Text>
              </View>
            )}
            {property.is_sold && (
              <View
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}
              >
                <Ionicons name="close-circle" size={11} color="#EF4444" />
                <Text className="text-xs font-semibold" style={{ color: '#EF4444' }}>
                  Sold
                </Text>
              </View>
            )}
          </View>

          {/* Title + Price */}
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {property.title}
          </Text>
          <View className="flex-row items-center gap-1.5 mb-5">
            <Text className="text-xl font-bold" style={{ color: '#0E4D92' }}>
              {formatPrice(property.price)}
            </Text>
          </View>

          {/* ── Specs Row ── */}
          <View
            className="flex-row justify-between rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <SpecItem
              icon="bed-outline"
              label="Beds"
              value={`${property.bedrooms}`}
            />
            <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
            <SpecItem
              icon="water-outline"
              label="Baths"
              value={`${property.bathrooms}`}
            />
            <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
            <SpecItem
              icon="expand-outline"
              label="Area"
              value={`${property.area_sqft} ft²`}
            />
            <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
            <SpecItem icon="home-outline" label="Type" value={property.type} />
          </View>

          {/* ── Description ── */}
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#0E4D92' }}
            />
            <Text className="text-base font-bold text-gray-900">
              Description
            </Text>
          </View>
          <Text className="text-gray-500 text-sm leading-6 mb-1">
            {displayDesc}
          </Text>
          {isLongDesc && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text className="text-sm font-semibold mb-5" style={{ color: '#0E4D92' }}>
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}

          <View className="mb-5" />

          {/* ── Location ── */}
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#F59E0B' }}
            />
            <Text className="text-base font-bold text-gray-900">
              Location
            </Text>
          </View>
          <View
            className="flex-row items-center gap-2.5 mb-4 px-3.5 py-3 rounded-2xl"
            style={{
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <View
              className="w-8 h-8 rounded-xl items-center justify-center"
              style={{ backgroundColor: '#0E4D92' }}
            >
              <Ionicons name="location" size={14} color="#fff" />
            </View>
            <Text className="text-gray-600 text-sm flex-1 font-medium">
              {property.address}, {property.city}
            </Text>
          </View>

          {/* Map Preview */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(root)/property/map' as any,
                params: {
                  latitude: property.latitude,
                  longitude: property.longitude,
                  title: property.title,
                  address: `${property.address}, ${property.city}`,
                },
              })
            }
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              height: 200,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <WebView
              source={{ uri: mapUrl }}
              style={{ flex: 1 }}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <View
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Ionicons name="expand-outline" size={12} color="#0E4D92" />
              <Text className="text-xs font-semibold" style={{ color: '#0E4D92' }}>
                Tap to expand
              </Text>
            </View>
          </TouchableOpacity>

          {/* ── Contact Button ── */}
          <TouchableOpacity
            onPress={handleContact}
            className="flex-row items-center justify-center gap-2.5 py-4 rounded-2xl mb-4"
            style={{
              backgroundColor: '#0E4D92',
              shadowColor: '#0E4D92',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text className="text-white font-bold text-base">
              Contact Agent
            </Text>
          </TouchableOpacity>

          {/* ── Admin Actions ── */}
          {isAdmin && (
            <View className="flex-row gap-3">
              {!property.is_sold && (
                <TouchableOpacity
                  onPress={handleMarkSold}
                  className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                  style={{
                    backgroundColor: '#FFFBEB',
                    borderWidth: 1,
                    borderColor: '#FDE68A',
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#D97706"
                  />
                  <Text className="font-semibold" style={{ color: '#D97706' }}>
                    Mark Sold
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                style={{
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text className="font-semibold" style={{ color: '#EF4444' }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Viewer */}
      <ImageViewing
        images={property.images.map((uri) => ({ uri }))}
        imageIndex={activeIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="items-center gap-1.5 flex-1">
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mb-0.5"
        style={{ backgroundColor: '#EFF6FF' }}
      >
        <Ionicons name={icon} size={18} color="#0E4D92" />
      </View>
      <Text className="text-gray-900 font-bold text-sm capitalize">{value}</Text>
      <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
  );
}
