import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ConnectURI, Metadata, NostrRPC } from '@nostr-connect/connect';
import EventEmitter from 'events';
import * as Clipboard from 'expo-clipboard';
import { Event, getPublicKey, nip19, signEvent } from 'nostr-tools';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';

import AppRow from '../components/AppRow';
import ApproveSignEvent from '../components/ApproveSignEvent';
import { Layout } from '../components/Layout';
import Scanner from '../components/Scanner';
import { darkBlue, babyBlue } from '../constants';
import { useAppsStore } from '../store';
import { deleteWallet, getWallet, PRIVATE_KEY_HEX } from '../store/secure';

class MobileHandler extends NostrRPC {
  events: EventEmitter;

  constructor({ secretKey }: { secretKey: string }) {
    super({ secretKey });
    this.events = new EventEmitter();
  }

  async get_public_key(): Promise<string> {
    return getPublicKey(this.self.secret);
  }

  async sign_event(event: Event): Promise<string> {
    if (!this.event) throw new Error('No origin event');
    this.events.emit('signEventRequest', {
      sender: this.event.pubkey,
      event,
    });
    return new Promise((resolve, reject) => {
      this.events.once('signEventApprove', () => {
        resolve(signEvent(event, this.self.secret));
      });
      this.events.once('signEventReject', () => {
        reject(new Error('User rejected request'));
      });
    });
  }
}

export default function ConnectList({ navigation }: { navigation: any }) {
  //store
  const apps = useAppsStore((state) => state.apps);
  const getApp = useAppsStore((state) => state.getAppByID);
  const addApp = useAppsStore((state) => state.addApp);
  const removeApps = useAppsStore((state) => state.removeApps);

  // state
  const [nostrID, setNostrID] = useState<string>();
  const [connectURI, setConnectURI] = useState<ConnectURI>();
  const [event, setEvent] = useState<Event>();
  const [metadata, setMetadata] = useState<Metadata>();
  const [handler, setHandler] = useState<NostrRPC>();
  const [showScanner, setScanner] = useState(false);

  //bottom sheet
  const snapPointsKeyInfo = useMemo(() => ['10%', '70%'], []);
  const snapPointsChoice = useMemo(() => ['10%', '20%'], []);
  const snapPointsApproveConnect = useMemo(() => ['10%', '40%'], []);
  const snapPointsApproveSignEvent = useMemo(() => ['10%', '80%'], []);

  const keyInfoModalRef = useRef<BottomSheetModal>(null);
  const inputChoiceModalRef = useRef<BottomSheetModal>(null);
  const approveConnectModalRef = useRef<BottomSheetModal>(null);
  const approveSignEventModalRef = useRef<BottomSheetModal>(null);

  const keyInfoModalShow = () => keyInfoModalRef.current && keyInfoModalRef.current.present();
  const inputChoiceModalShow = () =>
    inputChoiceModalRef.current && inputChoiceModalRef.current.present();
  const inputChoiceModalDismiss = () =>
    inputChoiceModalRef.current && inputChoiceModalRef.current.dismiss();
  const approveConnectModalShow = () =>
    approveConnectModalRef.current && approveConnectModalRef.current.present();
  const approveConnectModalDismiss = () =>
    approveConnectModalRef.current && approveConnectModalRef.current.dismiss();
  const approveSignEventModalShow = () =>
    approveSignEventModalRef.current && approveSignEventModalRef.current.present();
  const approveSignEventModalDismiss = () =>
    approveSignEventModalRef.current && approveSignEventModalRef.current.dismiss();

  useEffect(() => {
    (async () => {
      // check if handler is already initialized
      if (handler) return;

      // get wallet
      const key = await getWallet(PRIVATE_KEY_HEX);
      if (!key) return;

      // set the pub key
      const pub = getPublicKey(key);
      setNostrID(pub);

      const remoteHandler = new MobileHandler({
        secretKey: key,
      });
      try {
        await remoteHandler.listen();
      } catch (err: any) {
        console.error(err);
      }
      remoteHandler.events.on(
        'signEventRequest',
        ({ sender, event: evt }: { sender: string; event: Event }) => {
          const app = getApp(sender);
          //skip all events from unknown or not authorized apps
          if (app) {
            setEvent(evt);
            setMetadata({ name: app.name, url: app.url });
            approveSignEventModalShow();
          }
        }
      );
      remoteHandler.events.on('signEventReject', () => {
        approveSignEventModalDismiss();
      });
      setHandler(remoteHandler);
    })();
  }, [navigation, handler]);

  const scanQRCode = () => {
    inputChoiceModalDismiss();
    setScanner(true);
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    try {
      const uri = ConnectURI.fromURI(data);
      setConnectURI(uri);
      setScanner(false);
      approveConnectModalShow();
    } catch (err: any) {
      console.error(err);
      alert('Invalid Connect URI');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      const fakePastedText = `nostr://connect?target=b889ff5b1513b641e2a139f661a661364979c5beee91842f8f0ef42ab558e9d4&metadata={"name":"Vulpem Ventures","description":"lorem ipsum dolor sit amet","url":"https://vulpem.com","icons":["https://vulpem.com/1000x860-p-500.422be1bc.png"]}&relay=wss://nostr.vulpem.com`;
      setConnectURI(ConnectURI.fromURI(text || fakePastedText));

      inputChoiceModalDismiss();
      approveConnectModalShow();
    } catch (err: any) {
      console.error(err);
      alert('Invalid Connect URI');
    }
  };

  const approveConnect = async () => {
    if (!connectURI) return;
    // get wallet
    const key = await getWallet(PRIVATE_KEY_HEX);
    if (!key) return;

    await connectURI.approve(key);
    addApp({
      id: connectURI.target,
      relay: connectURI.relayURL,
      name: connectURI.metadata.name,
      label: connectURI.metadata.description || '',
      icons: connectURI.metadata.icons || [],
      url: connectURI.metadata.url,
    });

    approveConnectModalDismiss();
  };

  const approveSignEvent = async () => {
    if (!handler) return;

    handler.events.emit('signEventApprove');

    tearDownModals();
  };

  const keyInfoPress = () => {
    keyInfoModalShow();
  };

  const tearDownModals = () => {
    setEvent(undefined);
    setMetadata(undefined);

    inputChoiceModalDismiss();
    approveConnectModalDismiss();
    approveSignEventModalDismiss();
  };

  const deleteAll = async () => {
    const appsToRemove = apps;
    removeApps();

    const key = await getWallet(PRIVATE_KEY_HEX);
    if (!key) return;

    for (const app of appsToRemove) {
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
    }
  };

  const renderRow = ({ item }: { item: { id: string; name: string; url: string } }) => (
    <TouchableHighlight
      onPress={() =>
        navigation.navigate('Details', {
          id: item.id,
        })
      }>
      <AppRow {...item} />
    </TouchableHighlight>
  );

  return (
    <BottomSheetModalProvider>
      <Modal transparent visible={showScanner}>
        <View style={{ flex: 1 }}>
          <Scanner onData={handleBarCodeScanned} />
        </View>
      </Modal>
      <Layout>
        <View style={styles.container}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.title}>Connected Apps</Text>
            </View>
            <View style={{ marginLeft: 'auto', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={keyInfoPress} style={styles.button}>
                <Text style={{ fontSize: 32 }}>🔑</Text>
              </TouchableOpacity>
            </View>
          </View>
          {apps === null || apps.length === 0 ? (
            <>
              <View style={styles.top}>
                <Text style={styles.emoji}>🔌</Text>
                <Text style={[styles.text, { fontFamily: 'SoraBold' }]}>Nothing yet.</Text>
                <Text style={styles.text}>Connected apps will appear here</Text>
              </View>
              <View style={styles.bottom}>
                <TouchableOpacity onPress={inputChoiceModalShow} style={styles.button}>
                  <Text style={styles.buttonText}>➕ Connect App</Text>
                </TouchableOpacity>
                <Text style={styles.text}>Paste or Scan a Nostr Connect URI</Text>
              </View>
            </>
          ) : (
            <>
              <FlatList data={apps} renderItem={renderRow} keyExtractor={(row) => row.id} />
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <TouchableOpacity onPress={inputChoiceModalShow} style={styles.button}>
                    <Text style={styles.buttonText}>➕ Connect App</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{ marginLeft: 'auto', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity onPress={deleteAll} style={styles.button}>
                    <Text style={{ fontSize: 32 }}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
        <BottomSheetModal ref={inputChoiceModalRef} index={1} snapPoints={snapPointsChoice}>
          <View style={styles.bottomSheet}>
            <TouchableOpacity onPress={scanQRCode}>
              <Text style={styles.emoji}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pasteFromClipboard}>
              <Text style={styles.emoji}>📋</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
        {connectURI && (
          <BottomSheetModal
            ref={approveConnectModalRef}
            index={1}
            snapPoints={snapPointsApproveConnect}>
            <View style={styles.bottomSheet}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.bottomSheetTitle}>{connectURI.metadata.name}</Text>
                <Text style={styles.bottomSheetText}>
                  {new URL(connectURI.metadata.url).hostname}
                </Text>
                <Text style={styles.bottomSheetText}> wants to connect to your wallet </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: 'transparent' }]}
                    onPress={() => {
                      if (!handler) return;
                      handler.events.emit('approveConnectReject');
                      approveConnectModalDismiss();
                    }}>
                    <Text style={[styles.buttonText, { color: darkBlue }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={approveConnect}>
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </BottomSheetModal>
        )}
        {event && metadata && (
          <BottomSheetModal
            ref={approveSignEventModalRef}
            index={1}
            snapPoints={snapPointsApproveSignEvent}>
            <ApproveSignEvent
              name={metadata.name}
              url={metadata.url}
              event={event}
              onApprove={approveSignEvent}
              onReject={() => {
                if (!handler) return;
                handler.events.emit('signEventReject');
              }}
            />
          </BottomSheetModal>
        )}
        {nostrID && (
          <BottomSheetModal index={1} ref={keyInfoModalRef} snapPoints={snapPointsKeyInfo}>
            <View style={styles.keyInfo}>
              <Text style={styles.keyInfoTitle}>Nostr ID</Text>
              <TouchableOpacity onPress={async () => await Clipboard.setStringAsync(nostrID)}>
                <Text style={styles.keyInfoText}>{nip19.npubEncode(nostrID)}</Text>
              </TouchableOpacity>

              <Text style={styles.keyInfoTitle}>Secret</Text>
              <TouchableOpacity onPress={async () => await Clipboard.setStringAsync(nostrID)}>
                <Text style={styles.keyInfoText}>
                  {handler && nip19.nsecEncode(handler.self.secret)}
                </Text>
              </TouchableOpacity>

              <Button
                title="⚠️ Reset Secret"
                onPress={() => {
                  removeApps();
                  deleteWallet(PRIVATE_KEY_HEX);
                  navigation.navigate('Onboarding');
                }}
              />
            </View>
          </BottomSheetModal>
        )}
      </Layout>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  top: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'SoraBold',
  },
  bottomSheetText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'SoraRegular',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SoraBold',
    marginVertical: 24,
    color: '#fff',
  },
  text: {
    fontSize: 16,
    fontFamily: 'SoraRegular',
    marginBottom: 8,
    color: '#fff',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: darkBlue,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'SoraBold',
    color: babyBlue,
  },
  keyInfo: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 32,
  },
  keyInfoTitle: {
    fontSize: 24,
    fontFamily: 'SoraBold',
  },
  keyInfoText: {
    fontSize: 16,
    marginVertical: 16,
    fontFamily: 'SoraRegular',
  },
});
