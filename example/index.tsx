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
    mode: 'dev' as any,
  },
}).catch(console.log);

AppRegistry.registerComponent(appName, () => App);
