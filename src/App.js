import React, { Component } from "react";
import "./App.css";
import { Scene, Entity } from "aframe-react";

import PlayerManager from "./PlayerManager";

class App extends Component {
  render() {
    return (
      <Scene>
        <PlayerManager
          position={[0, 0, -5]}
          rotation={[0, 180, 0]}
        />
        <Entity position="0 0 0">
          <Entity primitive="a-box" position="0 0 -2" />
        </Entity>
        <Entity primitive="a-sky" material={{ color: "green" }} />
        <Entity
          geometry={{
            primitive: "plane",
            width: 10,
            height: 10
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
