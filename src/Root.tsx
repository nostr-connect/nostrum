import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PolyfillCrypto from 'react-native-webview-crypto';
import { useFonts, Sora_400Regular, Sora_600SemiBold } from '@expo-google-fonts/sora';

import { darkBlue } from './constants';

import ConnectDetails from './pages/ConnectDetails';
import ConnectList from './pages/ConnectList';

import Onboarding from './pages/Onboarding';
import { useCallback } from 'react';



const Stack = createNativeStackNavigator();
export default function Root() {
  let [fontsLoaded] = useFonts({ SoraRegular: Sora_400Regular, SoraBold: Sora_600SemiBold });
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
      <PolyfillCrypto />
    </GestureHandlerRootView>
  );
}
