import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const { latitude, longitude, title, address } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  }>();
  const router = useRouter();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.001
  }%2C${lat - 0.001}%2C${lng + 0.001}%2C${
    lat + 0.001
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View
        className="flex-row items-center justify-between px-5 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}
        >
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1 mx-3">
          <Text
            className="text-gray-900 font-bold text-sm"
            numberOfLines={1}
          >
            {title}
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Ionicons name="location" size={10} color="#0E4D92" />
            <Text
              className="text-xs font-medium"
              style={{ color: '#6B7280' }}
              numberOfLines={1}
            >
              {address}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)
          }
          className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-2xl"
          style={{
            backgroundColor: '#0E4D92',
            shadowColor: '#0E4D92',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons name="navigate" size={13} color="#fff" />
          <Text className="text-white text-xs font-bold">
            Directions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Map */}
      <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />

      {/* ── Bottom Info Bar ── */}
      <View
        className="px-5 py-4 flex-row items-center gap-3"
        style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6' }}
      >
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center"
          style={{ backgroundColor: '#EFF6FF' }}
        >
          <Ionicons name="location" size={18} color="#0E4D92" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-sm font-bold" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
            {address}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)
          }
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-full"
          style={{
            backgroundColor: '#FFFBEB',
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}
        >
          <Ionicons name="open-outline" size={12} color="#D97706" />
          <Text className="text-xs font-semibold" style={{ color: '#D97706' }}>
            Open
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}