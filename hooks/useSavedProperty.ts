import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const { userId } = useAuth();

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const checkIfSaved = useCallback(async () => {
    if (!userId || !propertyId) {
      setIsSaved(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_clerk_id', userId)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) {
        console.error('Failed to check saved property:', error);
        return;
      }

      setIsSaved(!!data);
    } catch (error) {
      console.error('Unexpected error checking saved property:', error);
    }
  }, [propertyId, userId]);

  useEffect(() => {
    checkIfSaved();
  }, [checkIfSaved]);

  const toggleSave = useCallback(async () => {
    if (!userId || !propertyId || saveLoading) return;

    setSaveLoading(true);

    try {
      if (isSaved) {
        setIsSaved(false);

        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_clerk_id', userId)
          .eq('property_id', propertyId);

        if (error) {
          setIsSaved(true);
          console.error('Failed to remove saved property:', error);
          return;
        }

        onUnsave?.();
      } else {
        setIsSaved(true);

        const { error } = await supabase.from('saved_properties').insert({
          user_clerk_id: userId,
          property_id: propertyId,
        });

        if (error) {
          setIsSaved(false);
          console.error('Failed to save property:', error);
        }
      }
    } catch (error) {
      setIsSaved(isSaved);
      console.error('Unexpected error toggling save:', error);
    } finally {
      setSaveLoading(false);
    }
  }, [isSaved, onUnsave, propertyId, saveLoading, userId]);

  return {
    isSaved,
    saveLoading,
    toggleSave,
    refresh: checkIfSaved,
  };
}
