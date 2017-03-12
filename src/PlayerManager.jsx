import React from "react";
import Player from "./Player";
import { Entity } from "aframe-react";

export default class PlayerManager extends React.Component {
  state = {
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  };
  hop = (rotation) => {
    const [x, y, z] = this.state.position;
    const newPos = [x, y, z - 0.2];
    this.setState({
      position: newPos,
    });
  }
  render() {
    const { position, rotation } = this.props;
    const { position: playerPos, rotation: playerRot } = this.state;
    return (
      <Entity {...{ position, rotation }}>
        <Player
          position={playerPos}
          rotation={playerRot}
          hop={this.hop}
        />
      </Entity>
    );
  }
}
