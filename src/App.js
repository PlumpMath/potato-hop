import React, { Component } from 'react';
import './App.css';
import { Scene, Entity } from 'aframe-react';
import firebase from 'firebase';

import PlayerManager from './PlayerManager';
import Player from './Player';

const firebaseConfig = {
  apiKey: 'AIzaSyBkEkDfcfDIL2MBYVkTs5CiAW_RHYeZtu0',
  authDomain: 'potato-hop.firebaseapp.com',
  databaseURL: 'https://potato-hop.firebaseio.com',
  storageBucket: 'potato-hop.appspot.com',
  messagingSenderId: '777440646254',
};
const app = firebase.initializeApp(firebaseConfig);

class App extends Component {
  state = {
    currentPlayer: null,
    players: [],
    manager: null,
  };

  componentDidMount() {
    // TODO: store player id in a cookie
    const db = app.database();
    const playersRef = db.ref('players');
    const manager = db.ref('manager');

    playersRef.on('value', snapshot => {
      const players = snapshot.val();
      this.setState({
        players,
      });
    });
    this.playerRef = playersRef.push({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    });
    this.playerRef.onDisconnect().remove();

    manager.once('value', (snapshot) => {
      const managerKey = snapshot.val();
      if (!managerKey) {
        manager.set(this.playerRef.key);
        manager.onDisconnect().remove();
        this.setState({manager: this.playerRef.key});
      } else {
        this.setState({manager: managerKey});
      }
    });

    // create a new player
    this.setState({
      currentPlayer: this.playerRef.key,
    });
  }

  playerUpdate = ({rotation}) => {
    if (this.playerRef) {
      this.playerRef.child('rotation').set(rotation);
    }
  }

  render() {
    const { currentPlayer } = this.state;
    const players = [];
    const player = currentPlayer
      ? <Player key={currentPlayer} onRotate={this.playerUpdate} active={true} />
      : null;
    return (
      <Scene>
        {player}
        <Entity position="0 0 0">
          <Entity primitive="a-box" position="0 0 -2" />
        </Entity>
        <Entity primitive="a-sky" material={{ color: 'green' }} />
        <Entity
          geometry={{
            primitive: 'plane',
            width: 10,
            height: 10,
          }}
          rotation={[-90, 0, 0]}
          material={{
            color: '#cccccc',
          }}
        />
      </Scene>
    );
  }
}

export default App;
