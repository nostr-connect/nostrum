import { sha256 } from '@noble/hashes/sha256';
import * as secp256k1 from '@noble/secp256k1';
import { NostrSigner } from '@nostr-connect/connect';
import { getPublicKey, signEvent, Event } from 'nostr-tools';

export default class NostrConnectHandler extends NostrSigner {
  async describe(): Promise<string[]> {
    return ["describe", "get_public_key", "sign_event"];
  }
  
  async get_public_key(): Promise<string> {
    return getPublicKey(this.self.secret);
  }

  async sign_event(event: Event): Promise<string> {
    if (!this.event) throw new Error('No origin event');

    // emit event to the UI to show a modal
    this.events.emit('sign_event_request', event);

    // wait for the user to approve or reject the request
    return new Promise((resolve, reject) => {
      // listen for user accept
      this.events.on('sign_event_approve', () => {
        resolve(signEvent(event, this.self.secret));
      });

      // or reject
      this.events.on('sign_event_reject', () => {
        reject(new Error('User rejected request'));
      });
    });
  }

  async sign_schnorr(message: string): Promise<string> {
    if (!this.event) throw new Error('No origin event');

    // emit event to the UI to show a modal
    this.events.emit('sign_schnorr_request', message);

    // wait for the user to approve or reject the request
    return new Promise((resolve, reject) => {
      // listen for user accept
      this.events.on('sign_schnorr_approve', async () => {
        const hash = sha256(message);
        const sig = await secp256k1.schnorr.sign(hash, this.self.secret);
        const hex = secp256k1.utils.bytesToHex(sig);

        resolve(hex);
      });

      // or reject
      this.events.on('sign_schnorr_reject', () => {
        reject(new Error('User rejected request'));
      });
    });
  }
}
