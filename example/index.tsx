import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import * as OkHi from 'react-native-okhi';

OkHi.initialize({
  credentials: {
    branchId: 'j6FX93TMPE',
    clientKey: '4e230b36-3fc9-4742-ab63-d521070ba012',
  },
  context: {
    mode: 'dev' as any,
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
