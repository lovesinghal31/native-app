import { useAuth } from '@clerk/expo';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // No manual navigation needed — Stack.Protected handles the transition
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView className="flex-grow bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold">ProfileScreen</Text>
        <TouchableOpacity onPress={handleSignOut} className="mt-4">
          <Text className="text-blue-600">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
