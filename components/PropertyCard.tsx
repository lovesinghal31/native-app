import { useSavedProperty } from '@/hooks/useSavedProperty';
import { formatPrice } from '@/lib/utils';
import { Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function PropertyCard({
  property,
  onUnsave,
  showSave = false,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}) {
  const router = useRouter();
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(
    property.id,
    onUnsave,
  );

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}` as any)}
      className="bg-white rounded-2xl mb-5 overflow-hidden"
      style={{
        shadowColor: '#0E4D92',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
        opacity: property.is_sold ? 0.55 : 1,
      }}
    >
      {/* Image Section */}
      <View className="relative">
        <Image
          source={{ uri: property.images[0] }}
          className="w-full h-44"
          resizeMode="cover"
        />

        {/* Type Badge */}
        <View
          className="absolute top-3 left-3 px-3 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(14, 77, 146, 0.85)' }}
        >
          <Text className="text-xs font-bold text-white capitalize">
            {property.type}
          </Text>
        </View>

        {/* Sold Badge */}
        {property.is_sold && (
          <View className="absolute top-3 right-3 bg-red-500/90 px-3 py-1 rounded-full">
            <Text className="text-xs font-bold text-white">Sold</Text>
          </View>
        )}

        {/* Save Button */}
        {showSave && (
          <TouchableOpacity
            onPress={toggleSave}
            disabled={saveLoading}
            className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={18}
              color={isSaved ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Info Section */}
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-1">
          <Text
            className="text-base font-bold text-gray-900 flex-1 mr-2"
            numberOfLines={1}
          >
            {property.title}
          </Text>
          <Text className="text-base font-bold text-primary">
            {formatPrice(property.price)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1 mb-3">
          <Ionicons name="location-outline" size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-400" numberOfLines={1}>
            {property.city}
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
            <Ionicons name="bed-outline" size={13} color="#0E4D92" />
            <Text className="text-xs text-gray-600 font-medium">
              {property.bedrooms} Beds
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
            <Ionicons name="expand-outline" size={13} color="#0E4D92" />
            <Text className="text-xs text-gray-600 font-medium">
              {property.area_sqft} ft²
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
            <Ionicons name="water-outline" size={13} color="#0E4D92" />
            <Text className="text-xs text-gray-600 font-medium">
              {property.bathrooms} Bath
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
