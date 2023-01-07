import { ConnectURI } from '@nostr-connect/connect';
import { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { Layout } from '../components/Layout';
import { useAppsStore } from '../store';
import { getWallet, PRIVATE_KEY_HEX } from '../store/secure';

export default function DetailsScreen({ navigation, route }: { route: any; navigation: any }) {
  const removeAppByID = useAppsStore((state) => state.removeAppByID);
  const getAppByID = useAppsStore((state) => state.getAppByID);
  const app = getAppByID(route.params.id);

  useEffect(() => {
    navigation.setOptions({
      title: app ? app.name : 'Details',
    });
  }, [navigation]);

  if (!app)
    return (
      <Layout>
        <View style={styles.view}>
          <Text style={styles.title}>We could not find an app with ID {route.params.id}</Text>
        </View>
      </Layout>
    );

  const disconnect = async () => {
    const key = await getWallet(PRIVATE_KEY_HEX);
    if (!key) return;

    const uri = new ConnectURI({
      target: app.id,
      metadata: {
        name: app.name,
        description: app.label,
        url: app.url,
        icons: app.icons,
      },
      relayURL: app.relay,
    });
    await uri.reject(key);
    removeAppByID(app.id);
    navigation.goBack();
  };

  return (
    <Layout>
      <View style={styles.view}>
        <Text style={styles.title}>{app.name}</Text>
        <Text style={styles.host}>🌎 {new URL(app.url).hostname}</Text>
        <Text style={styles.text}>💬 {app.label}</Text>
      </View>
      <View style={styles.view}>
        <Text style={styles.title}>🆔 App ID</Text>
        <Text style={styles.text}>{app.id}</Text>
      </View>
      <View style={styles.view}>
        <Text style={styles.title}>✋ Connection</Text>
        <Button title="Disconnect" onPress={disconnect} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  // settings view
  view: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SoraBold',
    marginBottom: 16,
    color: '#fff',
  },
  text: {
    fontSize: 16,
    fontFamily: 'SoraRegular',
    color: '#fff',
  },
  host: {
    fontSize: 16,
    fontFamily: 'SoraRegular',
    color: '#fff',
  },
});
