import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TYPES = ['apartment', 'house', 'villa', 'studio'] as const;
type PropertyType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const inputClass =
  'bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 text-gray-800 text-sm';
const sectionClass = 'mb-6';

interface FormState {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  price: '',
  type: 'apartment',
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  isFeatured: false,
  images: [],
  localImages: [],
};

export default function CreatePropertyScreen() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  // ─── Image Picker ──────────────────────────────────────────
  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6,
    });

    if (result.canceled) return;

    setUploadingImages(true);

    try {
      setUploadingImages(true);

      const uploadedUrls: string[] = [];
      const previewUris: string[] = [];

      for (const asset of result.assets) {
        const filename = `property_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.jpg`;

        const base64 = asset.base64!;

        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const { error } = await supabase.storage
          .from('property-images')
          .upload(filename, buffer, {
            contentType: 'image/jpeg',
          });

        if (error) throw error;

        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(filename);

        uploadedUrls.push(data.publicUrl);
        previewUris.push(asset.uri);
      }

      updateForm({
        images: [...form.images, ...uploadedUrls],
        localImages: [...form.localImages, ...previewUris],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Upload Failed', 'Failed to upload one or more images.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    updateForm({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  };

  // ─── Location Detection ────────────────────────────────────
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to detect coordinates.',
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
    } catch (err) {
      Alert.alert('Error', 'Could not detect location. Enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert('Validation', 'Title is required.');

    if (!form.price.trim())
      return Alert.alert('Validation', 'Price is required.');

    const priceNum = Number(form.price);

    if (Number.isNaN(priceNum) || priceNum < MIN_PRICE) {
      return Alert.alert('Validation', 'Price must be greater than ₹0.');
    }

    if (priceNum > MAX_PRICE) {
      return Alert.alert(
        'Validation',
        `Price cannot exceed ₹${MAX_PRICE.toLocaleString('en-IN')}.`,
      );
    }

    if (!form.address.trim())
      return Alert.alert('Validation', 'Address is required.');

    if (!form.city.trim())
      return Alert.alert('Validation', 'City is required.');

    if (form.images.length === 0)
      return Alert.alert('Validation', 'Please upload at least one image.');

    try {
      setSubmitting(true);

      const { error } = await supabase.from('properties').insert({
        title: form.title.trim(),
        description: form.description.trim(),
        price: priceNum,
        type: form.type,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
        address: form.address.trim(),
        city: form.city.trim(),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        images: form.images,
        is_featured: form.isFeatured,
        is_sold: false,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setForm(INITIAL_FORM);

      Alert.alert('Success 🎉', 'Property listed successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(root)/(tabs)'),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── UI Helpers ────────────────────────────────────────────
  const SectionHeader = ({ title, color = '#0E4D92' }: { title: string, color?: string }) => (
    <View className="flex-row items-center gap-2 mb-3">
      <View
        className="w-1.5 h-5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="text-base font-bold text-gray-900">
        {title}
      </Text>
    </View>
  );

  const Counter = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <View className="flex-1">
      <Text className="text-sm font-bold text-gray-900 mb-2">{label}</Text>
      <View 
        className="flex-row items-center rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' }}
      >
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, value - 1))}
          className="w-12 h-12 items-center justify-center bg-white"
          style={{ borderRightWidth: 1, borderRightColor: '#E5E7EB' }}
        >
          <Ionicons name="remove" size={18} color="#0E4D92" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-gray-900 font-bold text-base">
          {value}
        </Text>
        <TouchableOpacity
          onPress={() => onChange(value + 1)}
          className="w-12 h-12 items-center justify-center bg-white"
          style={{ borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}
        >
          <Ionicons name="add" size={18} color="#0E4D92" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Toggle = ({
    label,
    value,
    onChange,
    description,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    description?: string;
  }) => (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between p-4 rounded-2xl"
      style={{
        backgroundColor: value ? '#EFF6FF' : '#F8FAFC',
        borderWidth: 1,
        borderColor: value ? '#BFDBFE' : '#E5E7EB'
      }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="font-bold text-sm"
          style={{ color: value ? '#0E4D92' : '#374151' }}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-xs text-gray-500 mt-1">{description}</Text>
        )}
      </View>
      <View
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{
          backgroundColor: value ? '#0E4D92' : 'transparent',
          borderWidth: value ? 0 : 2,
          borderColor: '#D1D5DB'
        }}
      >
        {value && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 pt-5 pb-3">
          <Text className="text-2xl font-bold text-gray-900">
            Add Property
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            List a new property on the market
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Images ── */}
          <View className={sectionClass}>
            <View className="flex-row items-center justify-between mb-3">
              <SectionHeader title="Photos" color="#F59E0B" />
              <Text className="text-gray-400 text-xs font-medium">up to 6</Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {form.localImages.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-2xl"
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View 
                      className="absolute top-1.5 left-1.5 px-2 py-1 rounded-md"
                      style={{ backgroundColor: 'rgba(14, 77, 146, 0.9)' }}
                    >
                      <Text className="text-white text-[9px] font-bold tracking-wider">
                        COVER
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center border-2 border-white"
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={uploadingImages}
                  className="w-24 h-24 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: '#CBD5E1'
                  }}
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color="#0E4D92" />
                  ) : (
                    <>
                      <Ionicons
                        name="camera"
                        size={24}
                        color="#94A3B8"
                      />
                      <Text className="text-gray-400 text-xs mt-1 font-medium">Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Basic Info ── */}
          <View className={sectionClass}>
            <SectionHeader title="Basic Info" />
            
            <View className="gap-4">
              <View>
                <Text className="text-sm font-bold text-gray-900 mb-2">Title</Text>
                <TextInput
                  className={inputClass}
                  placeholder="e.g. Modern 3BHK in Bandra"
                  placeholderTextColor="#9CA3AF"
                  value={form.title}
                  onChangeText={(v) => updateForm({ title: v })}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-gray-900 mb-2">Description</Text>
                <TextInput
                  className={`${inputClass} h-28`}
                  placeholder="Describe the property..."
                  placeholderTextColor="#9CA3AF"
                  value={form.description}
                  onChangeText={(v) => updateForm({ description: v })}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* ── Price ── */}
          <View className={sectionClass}>
            <SectionHeader title="Pricing" color="#10B981" />
            <Text className="text-sm font-bold text-gray-900 mb-2">Price (₹)</Text>
            <View className="relative justify-center">
              <Text className="absolute left-4 font-bold text-gray-500 z-10" style={{ color: '#0E4D92' }}>₹</Text>
              <TextInput
                className={`${inputClass} pl-8`}
                placeholder="50,00,000"
                placeholderTextColor="#9CA3AF"
                value={form.price}
                onChangeText={(v) => updateForm({ price: v })}
                keyboardType="numeric"
              />
            </View>
            <Text className="text-xs text-gray-400 mt-2 ml-1 font-medium">
              Valid range: ₹1 – ₹{MAX_PRICE.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* ── Property Details ── */}
          <View className={sectionClass}>
            <SectionHeader title="Details" />
            
            <Text className="text-sm font-bold text-gray-900 mb-2 mt-1">Property Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {TYPES.map((t) => {
                const active = form.type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => updateForm({ type: t })}
                    className="px-4 py-2.5 rounded-2xl"
                    style={{
                      backgroundColor: active ? '#0E4D92' : '#F8FAFC',
                      borderWidth: 1,
                      borderColor: active ? '#0E4D92' : '#E5E7EB'
                    }}
                  >
                    <Text
                      className="text-sm font-bold capitalize"
                      style={{ color: active ? '#fff' : '#4B5563' }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row gap-4 mb-5">
              <Counter
                label="Bedrooms"
                value={form.bedrooms}
                onChange={(v) => updateForm({ bedrooms: v })}
              />
              <Counter
                label="Bathrooms"
                value={form.bathrooms}
                onChange={(v) => updateForm({ bathrooms: v })}
              />
            </View>

            <View>
              <Text className="text-sm font-bold text-gray-900 mb-2">Area (sq ft)</Text>
              <TextInput
                className={inputClass}
                placeholder="e.g. 1200"
                placeholderTextColor="#9CA3AF"
                value={form.areaSqft}
                onChangeText={(v) => updateForm({ areaSqft: v })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* ── Location ── */}
          <View className={sectionClass}>
            <SectionHeader title="Location" color="#F59E0B" />
            
            <View className="gap-4">
              <View>
                <Text className="text-sm font-bold text-gray-900 mb-2">Address</Text>
                <TextInput
                  className={inputClass}
                  placeholder="Street address"
                  placeholderTextColor="#9CA3AF"
                  value={form.address}
                  onChangeText={(v) => updateForm({ address: v })}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-gray-900 mb-2">City</Text>
                <TextInput
                  className={inputClass}
                  placeholder="e.g. Mumbai"
                  placeholderTextColor="#9CA3AF"
                  value={form.city}
                  onChangeText={(v) => updateForm({ city: v })}
                />
              </View>

              {/* Coordinates */}
              <View className="mt-2">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-bold text-gray-900">Coordinates</Text>
                  <TouchableOpacity
                    onPress={handleDetectLocation}
                    disabled={detectingLocation}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                  >
                    {detectingLocation ? (
                      <ActivityIndicator size="small" color="#0E4D92" />
                    ) : (
                      <Ionicons name="locate" size={12} color="#0E4D92" />
                    )}
                    <Text className="text-xs font-bold" style={{ color: '#0E4D92' }}>
                      {detectingLocation ? 'Detecting...' : 'Auto Detect'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextInput
                      className={inputClass}
                      placeholder="Latitude"
                      placeholderTextColor="#9CA3AF"
                      value={form.latitude}
                      onChangeText={(v) => updateForm({ latitude: v })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      className={inputClass}
                      placeholder="Longitude"
                      placeholderTextColor="#9CA3AF"
                      value={form.longitude}
                      onChangeText={(v) => updateForm({ longitude: v })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ── Toggles ── */}
          <View className="gap-3 mb-8">
            <Toggle
              label="Featured Property"
              description="Show this in the Featured section on home"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || uploadingImages}
            className="rounded-2xl py-4 items-center"
            style={{
              backgroundColor: '#0E4D92',
              shadowColor: '#0E4D92',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              opacity: submitting || uploadingImages ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                List Property
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
