import { generatePrivateKey } from 'nostr-tools';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, Modal, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import { Layout } from '../components/Layout';
import { darkBlue, babyBlue } from '../constants';
import { createWallet, getWallet, PRIVATE_KEY_HEX } from '../store/secure';
import { toPrivateKeyHex } from '../utils/keys';

export default function Onboarding({ navigation }: { navigation: any }) {
  // state
  const [userData, setUserData] = React.useState('');
  const [modalVisible, setModalVisible] = useState(false);

  //bottom sheet

  const showRestoreModal = () => setModalVisible(true);
  const hideRestoreModal = () => setModalVisible(false);

  const joinPress = async () => {
    const wallet = generatePrivateKey();
    await createWallet(PRIVATE_KEY_HEX, wallet);
    navigation.navigate('Apps');
  };

  const restorePress = async () => {
    try {
      const key = toPrivateKeyHex(userData);
      await createWallet(PRIVATE_KEY_HEX, key);
      hideRestoreModal();
      navigation.navigate('Apps');
    } catch (err: any) {
      console.error(err);
      Alert.alert('We cannot restore your wallet with this secret');
    }
  };

  useEffect(() => {
    (async () => {
      const wallet = await getWallet(PRIVATE_KEY_HEX);
      if (wallet) {
        navigation.navigate('Apps');
      }
    })();
  }, []);

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.emoji}>🌊</Text>
        </View>
        <View style={styles.middle}>
          <TouchableOpacity onPress={joinPress} style={styles.button}>
            <Text style={styles.buttonText}>Join Nostr</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity onPress={showRestoreModal}>
            <Text style={styles.link}>I have something already...</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="slide" visible={modalVisible} transparent>
        <View style={styles.centeredView}>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              position: 'absolute',
              width: wp(100),
              height: hp(100),
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <View style={styles.modalView}>
            <Text style={styles.modalText}>🧐 Paste what you have, will figure it out! </Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="nsec, private key or words"
              placeholderTextColor="gray"
              onChange={(e) => setUserData(e.nativeEvent.text)}
            />
            <TouchableOpacity onPress={restorePress} style={styles.modalButton}>
              <Text style={styles.modaleButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 100,
  },
  top: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  bottom: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 64,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    height: hp(50),
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTextInput: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderColor: 'transparent',
    fontSize: 16,
    fontFamily: 'SoraRegular',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'SoraRegular',
  },
  modalButton: {
    padding: 16,
    backgroundColor: darkBlue,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 16,
  },
  modaleButtonText: {
    fontSize: 24,
    fontFamily: 'SoraBold',
    color: 'white',
  },
  emoji: {
    fontSize: 96,
    fontFamily: 'SoraBold',
    marginHorizontal: 16,
  },
  button: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: babyBlue,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontFamily: 'SoraBold',
    fontSize: 24,
    fontWeight: 'bold',
    color: darkBlue,
  },
  link: {
    fontFamily: 'SoraRegular',
    fontSize: 16,
    fontWeight: 'bold',
    color: babyBlue,
  },
});
