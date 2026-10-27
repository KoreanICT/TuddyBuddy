import ReactDOM from 'react-dom/client';

import App from './App';
import { Provider } from 'react-redux';
import store from './login/reducers/store';
import axios from 'axios';
import { installAuthInterceptors } from './login/authHttp';
import { configureSession } from './login/session';
import { loginSuccess, logout } from './login/reducers/authReducer';

import './styles/global.css';
import { NotificationProvider } from './notification/NotificationProvider';

configureSession(session => store.dispatch(session ? loginSuccess(session) : logout()));
installAuthInterceptors(axios);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Provider store={store}>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </Provider>
);
