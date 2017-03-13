import React, { Component } from 'react';
import './App.css';
import { Scene, Entity } from 'aframe-react';
import firebase from 'firebase';

// import PlayerManager from './PlayerManager';
import Player from './Player';
import Sack from './Sack';

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
    // TODO: noramlize players
    players: {},
    sacks: [[]],
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

    manager.once('value', snapshot => {
      const managerKey = snapshot.val();
      if (!managerKey) {
        manager.set(this.playerRef.key);
        manager.onDisconnect().remove();
        this.setState({ manager: this.playerRef.key });
        this.actAsManager(db);
      } else {
        this.setState({ manager: managerKey });

        // only clients need to sync this, manager holds the truth
        db.ref('sacks').on('value', snapshot => {
          const sacks = snapshot.val();
          this.setState({ sacks });
        });
      }
    });

    // create a new player
    this.setState({
      currentPlayer: this.playerRef.key,
    });
  }

  actAsManager = db => {
    // assign player some sacks
    db.ref('players').once('value', snapshot => {
      // assign sacks
      const players = snapshot.val();
    });

    const sacksRef = db.ref('sacks');
    sacksRef.onDisconnect().remove();

    let playerAssignments = [[]];

    // NOTE: probably tons of race conditions here
    const playersRef = db.ref('players');

    playersRef.on('child_removed', snapshot => {
      const { sack } = snapshot.val();
      // removeo from sacks
      if (sack) {
        sacksRef.child(sack.join('/')).remove();
        sacksRef.once('value', snapshot => {
          playerAssignments = snapshot.val() || [[]];
        });
      }
    });

    playersRef.on('child_added', snapshot => {
      const key = snapshot.key;
      const player = snapshot.val();
      console.log('player added', player);
      const playerRef = db.ref(`players/${key}`);
      if (!player.sack) {
        const count = playerAssignments.length;
        playerAssignments = playerAssignments.reduce(
          (sacks, sack, idx) => {
            // if the sack has space
            if (sack.length < 2) {
              sacks[idx] = [...sack, key];
              playerRef.update({
                sack: [idx, sack.length],
              });
              return sacks;
            }

            // if there are no more sacks
            if (idx === count - 1) {
              playerRef.update({
                sack: [count, 0],
              });
              return [...sacks, [key]];
            }

            // if the sack is full
            return sacks;
          },
          playerAssignments,
        );
        sacksRef.set(playerAssignments);
        this.setState({ sacks: playerAssignments });
      }
    });
    // do something to start game
  };

  playerUpdate = ({ rotation }) => {
    if (this.playerRef) {
      this.playerRef.child('rotation').set(rotation);
    }
  };
  // const player = currentPlayer
  //   ? <Player key={currentPlayer} onRotate={this.playerUpdate} active={true} />
  //   : null;
  render() {
    const spacing = 1;
    const sackSize = 2 + spacing;
    const { currentPlayer, players, sacks } = this.state;
    const teams = sacks.map(([player1key, player2key], idx) => {
      const position = [(-1 * sackSize) * idx, 0, 0];
      const player1 = players[player1key] ? {
        ...players[player1key],
        key: player1key,
        active: currentPlayer === player1key,
      } : {};
      const player2 = players[player2key] ? {
        ...players[player2key],
        key: player2key,
        active: currentPlayer === player2key,
      } : {};
      return <Sack key={idx} onRotate={this.playerUpdate} position={position} player1={player1} player2={player2} />;
    });
    return (
      <Scene>
        {teams}
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
