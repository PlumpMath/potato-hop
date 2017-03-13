import React, { Component } from "react";
import { Entity } from "aframe-react";
import Player from "./Player";

export default class Sack extends Component {
  static propTypes = {
    player1: React.PropTypes.object,
    player2: React.PropTypes.object,
    position: React.PropTypes.array,
    rotation: React.PropTypes.array
  };

  state = {
  };

  render() {
    const {
      children,
      position,
      rotation,
      player1,
      player2,
      onRotate,
      onMove,
    } = this.props;
    // we dont' care about player position, only sack position
    const positions = [[0.5, 0, 0], [-0.5, 0, 0]];
    const players = [
      player1,
      player2
    ].map((// { position, rotation, key, active },
    { rotation, key, active }, idx) => {
      const position = positions[idx];
      const alive = position && rotation;
      const player = alive
        ? <Player
            id={key}
            filled={alive}
            active={active}
            {...active ? { onRotate, onMove } : {}}
            position={position}
            rotation={
              rotation ? [rotation.x, rotation.y, rotation.z] : [0, 0, 0]
            }
          />
        : <Entity
            position={position}
            geometry={{ primitive: "box" }}
          />;

      return (
        <Entity key={key || idx}>
          {player}
        </Entity>
      );
    });
    return (
      <Entity {...{ position, rotation }}>
        {players}
      </Entity>
    );
  }
}
