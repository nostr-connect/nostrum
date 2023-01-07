# 🌊 Nostrum

Keep your Nostr keys safe. 


## 📖 About

Nostrum it's a mobile app that allows you to sign transactions and messages with your Nostr keys. 
Nostrum is the reference implementation for a remote signer app (ie. Wallet) of the [Nostr Connect](https://github.com/nostr-connect/nips/blob/nostr-connect/nip-nostr-connect.md) protocol.



## 👩‍💻 Development

### Requirements

- React Native
- Node.js
- Yarn


### Installation

```bash
yarn install
```

### Running

```bash
yarn ios
yarn android
```

## 🚢 Release

It requires an expo account and the expo-cli installed.

```bash
# iOS
eas build --platform ios
eas submit --platform ios
# Android
eas build --platform android
eas submit --platform android
```

