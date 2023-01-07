/* polyfills */
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { registerRootComponent } from 'expo';
import TextEncodingPolyfill from 'text-encoding';

import Root from './Root';

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
});

registerRootComponent(Root);
