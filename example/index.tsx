import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import * as OkHi from 'react-native-okhi';

OkHi.initialize({
  credentials: {
    branchId: '',
    clientKey: '',
  },
  context: {
    mode: 'sandbox',
  },
  notification: {
    title: 'Address verification in progress',
    text: 'Tap here to view your verification status.',
    channelId: 'okhi',
    channelName: 'OkHi Channel',
    channelDescription: 'OkHi verification alerts',
  },
})
  .then(() => console.log('init done'))
  .catch(console.log);

AppRegistry.registerComponent(appName, () => App);
