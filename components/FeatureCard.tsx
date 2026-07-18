import { formatPrice } from '@/lib/utils';
import { Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function FeaturedCard({ property }: { property: Property }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}` as any)}
      className="w-80 mr-5 rounded-3xl overflow-hidden"
      style={{
        shadowColor: '#0E4D92',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 8,
        opacity: property.is_sold ? 0.55 : 1,
      }}
    >
      {/* Full-bleed Image */}
      <View className="h-56 relative">
        <Image
          source={{ uri: property.images[0] }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}>
          <View style={{ flex: 2, backgroundColor: 'rgba(0,0,0,0.0)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.10)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.80)' }} />
        </View>

        {/* Top Badges */}
        <View className="absolute top-3 left-3 right-3 flex-row justify-between items-start">
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            <Text className="text-xs font-bold text-white capitalize tracking-wide">
              {property.type}
            </Text>
          </View>

          {property.is_sold && (
            <View className="bg-red-500/90 px-3 py-1.5 rounded-full">
              <Text className="text-xs font-bold text-white">Sold</Text>
            </View>
          )}
        </View>

        {/* Bottom Content – over gradient */}
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <Text
            className="text-white text-lg font-bold mb-1"
            numberOfLines={1}
            style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}
          >
            {property.title}
          </Text>

          <View className="flex-row items-center gap-1 mb-3">
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text
              className="text-xs text-white/90 font-medium"
              numberOfLines={1}
              style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}
            >
              {property.address}, {property.city}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="bg-accent px-3.5 py-1.5 rounded-full">
              <Text className="text-xs font-bold text-white">
                {formatPrice(property.price)}
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full">
                <Ionicons name="bed-outline" size={12} color="rgba(255,255,255,0.9)" />
                <Text className="text-xs text-white/90 font-medium">{property.bedrooms}</Text>
              </View>
              <View className="flex-row items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full">
                <Ionicons name="water-outline" size={12} color="rgba(255,255,255,0.9)" />
                <Text className="text-xs text-white/90 font-medium">{property.bathrooms}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
