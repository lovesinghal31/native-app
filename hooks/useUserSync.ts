import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { useUser } from '@clerk/expo';
import { useEffect } from 'react';

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .upsert(
            {
              clerk_id: user.id,
              email: user.primaryEmailAddress?.emailAddress ?? null,
              first_name: user.firstName ?? null,
              last_name: user.lastName ?? null,
              avatar_url: user.imageUrl ?? null,
            },
            {
              onConflict: 'clerk_id',
            },
          )
          .select('is_admin')
          .single();

        if (error) {
          console.error('Failed to sync user:', error);
          return;
        }

        setIsAdmin(data?.is_admin ?? false);
      } catch (error) {
        console.error('Unexpected error while syncing user:', error);
      }
    };

    syncUser();
  }, [isLoaded, user, setIsAdmin]);
}
