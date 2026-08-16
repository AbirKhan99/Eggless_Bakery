import { useState, useEffect } from 'react';
import { supabase, type BusinessSetting } from './supabase';

export interface BusinessSettingsMap {
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  hours_display?: string;
  hours_note?: string;
  google_maps_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  [key: string]: string | undefined;
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const { data, error: fetchError } = await supabase
          .from('business_settings')
          .select('*');

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted && data) {
          const map: BusinessSettingsMap = {};
          data.forEach((row: BusinessSetting) => {
            map[row.key] = row.value;
          });
          setSettings(map);
        }
      } catch (err: unknown) {
        console.error('Error fetching business settings:', err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load business settings'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading, error };
}
