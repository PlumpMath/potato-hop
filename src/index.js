import AFRAME from 'aframe';
import extras from 'aframe-extras';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

extras.loaders.registerAll(AFRAME);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
