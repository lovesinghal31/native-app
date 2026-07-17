import { useSignIn } from '@clerk/expo';
import { Link } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const isLoading = fetchStatus === 'fetching';

  const completeSignIn = useCallback(async () => {
    await signIn.finalize();
  }, [signIn]);

  const onSignInPress = async () => {
    try {
      const { error } = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) return;

      switch (signIn.status) {
        case 'complete':
          await completeSignIn();
          break;

        case 'needs_second_factor':
          await signIn.mfa.sendPhoneCode();
          break;

        case 'needs_client_trust':
          await signIn.mfa.sendEmailCode();
          break;

        default:
          console.log(signIn.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onVerifyPress = async () => {
    try {
      await signIn.mfa.verifyEmailCode({ code });

      if (signIn.status === 'complete') {
        await completeSignIn();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (signIn.status === 'needs_client_trust') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 justify-center px-6">
            <Image
              source={require('../../assets/images/kribb.png')}
              className="w-36 h-16 self-center mb-8"
              resizeMode="contain"
            />

            <Text className="text-3xl font-bold text-center text-black">
              Verify your account
            </Text>

            <Text className="text-gray-500 text-center mt-2 mb-8">
              Enter the verification code sent to your email.
            </Text>

            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-4 text-black"
              placeholder="Verification code"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />

            {errors.fields.code && (
              <Text className="text-red-500 mt-2">
                {errors.fields.code.message}
              </Text>
            )}

            <TouchableOpacity
              disabled={isLoading}
              onPress={onVerifyPress}
              className="bg-blue-600 rounded-xl py-4 mt-8 items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Verify
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-5 items-center"
              onPress={() => signIn.mfa.sendEmailCode()}
            >
              <Text className="text-blue-600">Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 items-center"
              onPress={() => signIn.reset()}
            >
              <Text className="text-blue-600">Start Over</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../assets/images/kribb.png')}
            className="w-40 h-16 mb-10"
            resizeMode="contain"
          />

          <Text className="text-4xl font-bold text-black">Welcome Back</Text>

          <Text className="text-gray-500 mt-2 mb-8">Sign in to continue.</Text>

          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-4 text-black mb-4"
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {errors.fields.identifier && (
            <Text className="text-red-500 mb-4">
              {errors.fields.identifier.message}
            </Text>
          )}

          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-4 text-black mb-6"
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {errors.fields.password && (
            <Text className="text-red-500 mb-6">
              {errors.fields.password.message}
            </Text>
          )}

          <TouchableOpacity
            disabled={isLoading}
            onPress={onSignInPress}
            className="bg-blue-600 rounded-xl py-4 items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Don't have an account? </Text>

            <Link href="/sign-up">
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
