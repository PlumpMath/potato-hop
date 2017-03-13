import React, { Component } from "react";
import { Entity } from "aframe-react";
import Player from "./Player";
import { Motion, spring } from "react-motion";

export default class Sack extends Component {
  static propTypes = {
    player1: React.PropTypes.object,
    player2: React.PropTypes.object,
    position: React.PropTypes.array,
    rotation: React.PropTypes.array
  };

  state = {};

  render() {
    const {
      children,
      position: sackPosition,
      rotation,
      player1,
      player2,
      onRotate,
      onMove
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
        : <Entity position={[0, 2, 0]}><Entity
            position={position}
            geometry={{ primitive: "box", width: 0.5, height: 0.5, depth: 0.5 }}
            material={{ opacity: 0.5 }}
          /></Entity>;

      return (
        <Entity key={key || idx}>
          {player}
        </Entity>
      );
    });

    const finalStyle = {
      z: spring(sackPosition[2])
    };

    return (
      <Entity>
        <Motion style={finalStyle}>
          {style => {
            const [x, y] = sackPosition;
            return (
              <Entity {...{ position: [x, y, style.z], rotation }}>
                {players}
                <Entity
                  scale={[0.03, 0.03, 0.03]}
                  rotation={[0, -45, 0]}
                  material={{
                    color: "brown"
                  }}
                  obj-model="obj: url(/potato_sack.obj);"
                />
              </Entity>
            );
          }}
        </Motion>
      </Entity>
    );
  }
}
