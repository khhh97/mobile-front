import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducer';

const middlewares = [thunkMiddleware];
if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger());
}

export default function configStore() {
  const store = createStore(rootReducer, applyMiddleware(...middlewares));
  return store;
}