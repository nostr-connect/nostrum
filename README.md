# 🌊 Nostrum
Keep your Nostr keys safe. 

## ⛹️‍♀️ Try now!

- [iOS TestFlight](https://testflight.apple.com/join/JIbjvN2p)
- [Android APK](https://expo.dev/accounts/nostr-connect/projects/nostrum/builds/5a72132e-6545-4c85-aee7-9b702c681e61)

## 🎬 Demo
https://user-images.githubusercontent.com/3596602/211125690-a16d0d3d-d010-44b2-85e3-94b4e9f476c7.mp4

## 📖 About

Nostrum it's a mobile app that allows you to sign transactions and messages with your Nostr keys. 
Nostrum is the reference implementation for a remote signer app (ie. Wallet) of the [Nostr Connect](https://github.com/nostr-connect/nips/blob/nostr-connect/46.md) protocol.


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

