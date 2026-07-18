import { useUserSync } from '@/hooks/useUserSync';
import { Slot } from 'expo-router';

export default function RootLayout() {
  // syncing user with supabase
  useUserSync();
  return <Slot />;
}
