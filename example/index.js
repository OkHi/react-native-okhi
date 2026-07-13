import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(
  Platform.OS === 'android' ? appName : 'OkHi App',
  () => App
);
