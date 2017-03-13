import React, { Component } from "react";
import "./App.css";
import { Scene, Entity } from "aframe-react";
import firebase from "firebase";

import Player from "./Player";
import Sack from "./Sack";

const firebaseConfig = {
  apiKey: "AIzaSyBkEkDfcfDIL2MBYVkTs5CiAW_RHYeZtu0",
  authDomain: "potato-hop.firebaseapp.com",
  databaseURL: "https://potato-hop.firebaseio.com",
  storageBucket: "potato-hop.appspot.com",
  messagingSenderId: "777440646254"
};
const app = firebase.initializeApp(firebaseConfig);

class App extends Component {
  state = {
    currentPlayer: null,
    // TODO: noramlize players
    players: {},
    sacks: [[]],
    sackPositions: [],
    manager: null
  };

  componentDidMount() {
    // TODO: store player id in a cookie
    const db = app.database();
    const playersRef = db.ref("players");
    const manager = db.ref("manager");

    playersRef.on("value", snapshot => {
      const players = snapshot.val();
      this.setState({
        players
      });
    });
    this.playerRef = playersRef.push({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    });
    this.playerRef.onDisconnect().remove();
    this.playerMoveRef = db.ref(`playerMoves/${this.playerRef.key}`);

    manager.once("value", snapshot => {
      const managerKey = snapshot.val();
      if (!managerKey) {
        manager.set(this.playerRef.key);
        manager.onDisconnect().remove();
        this.setState({ manager: this.playerRef.key });
        this.actAsManager(db);
      } else {
        this.setState({ manager: managerKey });

        // only clients need to sync this, manager holds the truth
        db.ref("sacks").on("value", snapshot => {
          const sacks = snapshot.val();
          this.setState({ sacks });
        });

        db.ref("sackPositions").on("value", snapshot => {
          const sackPositions = snapshot.val();
          this.setState({
            sackPositions
          });
        });
      }
    });

    // create a new player
    this.setState({
      currentPlayer: this.playerRef.key
    });
  }

  actAsManager = db => {
    // assign player some sacks

    const sacksRef = db.ref("sacks");
    const sackPosRef = db.ref("sackPositions");
    sacksRef.onDisconnect().remove();
    sackPosRef.onDisconnect().remove();

    // sacksRef.on('child_added', (snapshot) => {
    //   const sack = snpashot.val();
    //   // initialze sack position
    // });

    let playerAssignments = [[]];

    // NOTE: probably tons of race conditions here
    const playersRef = db.ref("players");

    playersRef.on("child_removed", snapshot => {
      const { sack } = snapshot.val();
      // removeo from sacks
      if (sack) {
        sacksRef.child(sack.join("/")).remove();
        sacksRef.once("value", snapshot => {
          playerAssignments = snapshot.val() || [[]];
        });
      }
    });

    const addSack = id => {
      const { sackPositions } = this.state;
      const position = { x: 0, y: 0, z: 0 };
      this.setState({
        sackPositions: [...sackPositions, position]
      });
      sackPosRef.child(id).set(position);
    };

    // add initial sack position
    addSack(0);

    playersRef.on("child_added", snapshot => {
      const key = snapshot.key;
      const player = snapshot.val();
      console.log("player added", player);
      const playerRef = db.ref(`players/${key}`);
      if (!player.sack) {
        const count = playerAssignments.length;
        playerAssignments = playerAssignments.reduce(
          (sacks, sack, idx) => {
            // if the sack has space
            if (sack.length < 2) {
              sacks[idx] = [...sack, key];
              playerRef.update({
                sack: [idx, sack.length]
              });
              return sacks;
            }

            // if there are no more sacks
            if (idx === count - 1) {
              playerRef.update({
                sack: [count, 0]
              });

              // push initial sack position
              addSack(count);

              return [...sacks, [key]];
            }

            // if the sack is full
            return sacks;
          },
          playerAssignments
        );
        sacksRef.set(playerAssignments);
        this.setState({ sacks: playerAssignments });
      }
    });
    // do something to start game

    // handle movement
    const playerMovesRef = db.ref("playerMoves");
    playerMovesRef.on("value", snapshot => {
      const { sacks } = this.state;
      const moves = snapshot.val();
      sacks.forEach((sack, sackId) => {
        const [player1, player2] = sack;
        if (player1 && player2) {
          const takeAction = moves[player1] && moves[player2];
          if (takeAction) {
            const position = this.state.sackPositions[sackId];
            const newPosition = {
              ...position,
              z: position.z - 1
            };
            // update ref to false
            db.ref(`playerMoves/${player1}`).set(false);
            db.ref(`playerMoves/${player2}`).set(false);
            sackPosRef.child(sackId).update(newPosition);
            let newPositions = [...this.state.sackPositions];
            newPositions[sackId] = newPosition;
            this.setState({
              sackPositions: newPositions
            });
          }
        }
      });
    });
    playerMovesRef.onDisconnect().remove();
  };

  playerRotate = ({ rotation }) => {
    if (this.playerRef) {
      this.playerRef.child("rotation").set(rotation);
    }
  };

  playerMove = key => {
    // get the player's sack
    const { players } = this.state;
    const player = players[key];
    this.playerMoveRef.set(true);
  };

  render() {
    const spacing = 1;
    const sackSize = 2 + spacing;
    const { currentPlayer, players, sacks } = this.state;
    const teams = sacks.map(([player1key, player2key], idx) => {
      // move sack in one direction
      const { z: sackZ } = this.state.sackPositions[idx] || { z: 0 };
      const position = [(-1) * sackSize * idx, 0, sackZ];

      const player1 = players[player1key]
        ? {
            ...players[player1key],
            key: player1key,
            active: currentPlayer === player1key
          }
        : {};
      const player2 = players[player2key]
        ? {
            ...players[player2key],
            key: player2key,
            active: currentPlayer === player2key
          }
        : {};
      return (
        <Sack
          key={idx}
          onRotate={this.playerRotate}
          onMove={this.playerMove}
          position={position}
          player1={player1}
          player2={player2}
        />
      );
    });
    return (
      <Scene>
        {teams}
        <Entity position="0 0 0">
          <Entity primitive="a-box" position="0 0 -2" />
        </Entity>
        <Entity primitive="a-sky" material={{ color: "black" }} />
        <Entity
          position={[0, 0, -8]}
          geometry={{
            primitive: "plane",
            width: 10,
            height: 20
          }}
          rotation={[-90, 0, 0]}
          material={{
            color: "#cccccc"
          }}
        />
      </Scene>
    );
  }
}

export default App;
