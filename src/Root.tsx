import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PolyfillCrypto from 'react-native-webview-crypto';
import { useFonts, Sora_400Regular, Sora_600SemiBold } from '@expo-google-fonts/sora';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { darkBlue } from './constants';

import ConnectDetails from './screens/ConnectDetails';
import ConnectList from './screens/ConnectList';

import Onboarding from './screens/Onboarding';
import { useCallback } from 'react';
import { useAppsStore } from './store';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
export default function Root() {
  const isRehydrated = useAppsStore((state) => state.rehydrated);
  const [fontsLoaded] = useFonts({ SoraRegular: Sora_400Regular, SoraBold: Sora_600SemiBold });
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isRehydrated) {
      // wait to hide splash screen
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerTintColor: 'white',
              headerStyle: { backgroundColor: darkBlue },
            }}>
            <Stack.Screen name="Onboarding" options={{ 
              headerShown: false,
             }}>
              {(props) => <Onboarding {...props} />}
            </Stack.Screen>
            <Stack.Screen
              name="Apps"
              options={{
                headerShown: false,
              }}>
              {(props) => <ConnectList {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Details"  options={{
              headerBackTitleStyle: { fontFamily: 'SoraRegular', fontSize: 16 },
              headerBackTitle: 'Apps',
              headerTitleStyle: { fontFamily: 'SoraBold', fontSize: 16 },
            }}>
              {(props) => <ConnectDetails {...props}/>}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
      <StatusBar style={'light'} />
      <PolyfillCrypto />
    </GestureHandlerRootView>
  );
}
