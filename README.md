# đ Nostrum
Keep your Nostr keys safe. 

## âšī¸ââī¸ Try now!

- [iOS TestFlight](https://testflight.apple.com/join/JIbjvN2p)
- [Android APK](https://expo.dev/accounts/nostr-connect/projects/nostrum/builds/c044bec4-014c-4ea7-b625-69c556a28155)

## đŦ Demo
https://user-images.githubusercontent.com/3596602/211125690-a16d0d3d-d010-44b2-85e3-94b4e9f476c7.mp4

## đ About

Nostrum it's a mobile app that allows you to sign transactions and messages with your Nostr keys. 
Nostrum is the reference implementation for a remote signer app (ie. Wallet) of the [Nostr Connect](https://github.com/nostr-connect/nips/blob/nostr-connect/46.md) protocol.


## đŠâđģ Development

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

## đĸ Release

It requires an expo account and the expo-cli installed.

```bash
# iOS
eas build --platform ios
eas submit --platform ios
# Android
eas build --platform android
eas submit --platform android
```

