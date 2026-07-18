import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpdateProfileImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to update your profile picture.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      setIsUpdating(true);

      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      await user?.setProfileImage({ file: dataUrl });

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert(
        'Error',
        'Failed to update profile picture. Please try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0E4D92" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Header ── */}
        <View className="px-5 pt-5 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Profile
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              Manage your account
            </Text>
          </View>
        </View>

        {/* ── Avatar + Name ── */}
        <View className="items-center py-6 mt-2">
          <View className="relative">
            <View 
              style={{ 
                shadowColor: '#0E4D92', 
                shadowOffset: { width: 0, height: 4 }, 
                shadowOpacity: 0.15, 
                shadowRadius: 12, 
                elevation: 6 
              }}
            >
              <Image
                source={{ uri: user.imageUrl }}
                className="w-28 h-28 rounded-full mb-4"
                style={{ borderWidth: 4, borderColor: '#F8FAFC' }}
              />
            </View>
            <TouchableOpacity
              onPress={handleUpdateProfileImage}
              disabled={isUpdating}
              className="absolute bottom-4 right-0 w-9 h-9 rounded-full items-center justify-center"
              style={{
                backgroundColor: '#0E4D92',
                borderWidth: 3,
                borderColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={14} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-gray-500 mt-1 font-medium text-sm">
            {user.emailAddresses[0].emailAddress}
          </Text>
        </View>

        {/* ── Settings Sections ── */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#0E4D92' }}
            />
            <Text className="text-base font-bold text-gray-900">
              Preferences
            </Text>
          </View>

          <View className="gap-3 mb-8">
            <MenuItem
              icon="heart"
              iconBg="#EFF6FF"
              iconColor="#0E4D92"
              label="Saved Properties"
              onPress={() => router.push('/(root)/(tabs)/saved')}
            />
            <MenuItem
              icon="notifications"
              iconBg="#FFFBEB"
              iconColor="#D97706"
              label="Notifications"
              onPress={() =>
                Alert.alert('Coming Soon', 'Notifications coming soon!')
              }
            />
          </View>

          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-1.5 h-5 rounded-full"
              style={{ backgroundColor: '#F59E0B' }}
            />
            <Text className="text-base font-bold text-gray-900">
              Account
            </Text>
          </View>

          <View className="gap-3">
            <MenuItem
              icon="settings"
              iconBg="#F3F4F6"
              iconColor="#4B5563"
              label="Settings"
              onPress={() => Alert.alert('Coming Soon', 'Settings coming soon!')}
            />
            <MenuItem
              icon="help-circle"
              iconBg="#F0FDF4"
              iconColor="#16A34A"
              label="Help & Support"
              onPress={() =>
                Linking.openURL(
                  'mailto:piyushagarwalvo@gmail.com?subject=Help%20%26%20Support%20-%20Kribb%20App',
                )
              }
            />
          </View>
        </View>

        {/* ── Sign Out ── */}
        <View className="px-5 mt-10 mb-8">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl"
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  iconBg,
  iconColor
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-4 px-4 py-3.5 rounded-2xl"
      style={{
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="flex-1 text-gray-900 font-semibold text-sm">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
