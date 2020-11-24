import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Pathfinder from './components/Pathfinder';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './app/reducers'

const store = createStore(rootReducer)

ReactDOM.render(
  <React.StrictMode>
    	<Provider store={store}>
		    <Pathfinder />
	    </Provider>,
  </React.StrictMode>,
  document.getElementById('root')
);
