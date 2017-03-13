import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Entity } from 'aframe-react';
import Shake from 'shake.js';

export default class Player extends Component {
  static propTypes = {
    active: React.PropTypes.bool,
    position: React.PropTypes.array,
    rotation: React.PropTypes.array,
    hop: React.PropTypes.func,
    onRotate: React.PropTypes.func,
  };

  static defaultProps = {
    active: false,
  };

  componentDidMount() {
    if (this.props.active) {
      const { onRotate } = this.props;
      const shake = new Shake();
      shake.start();
      window.addEventListener('shake', this.hop, false);

      let lastRotation = {};

      this.rotating = setInterval(
        () => {
          if (this.camera) {
            const rotation = this.camera.getAttribute('rotation');
            if (
              lastRotation.x !== rotation.x ||
              lastRotation.y !== rotation.y ||
              lastRotation.z !== rotation.z
            ) {
              if (onRotate) {
                onRotate({ rotation });
              } else {
                console.log(rotation);
              }
              lastRotation = rotation;
            }
          }

          // get rotation
        },
        120,
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.rotating);
    window.removeEventListener('shake', this.hop);
  }
  hop = () => {
    const { hop } = this.props;
    if (this.camera) {
      const rotation = this.camera.getAttribute('rotation');
      hop(rotation);
    }
  };
  render() {
    const { active, filled, position, rotation } = this.props;
    const cameraOpts = active ? { 'look-controls': '' } : {};
    const person = filled
      ? <Entity position={[0, 1.6, 0]} {...active ? {} : { rotation }}>
          <Entity
            ref={el => {
              const node = ReactDOM.findDOMNode(el);
              if (el && node) {
                this.camera = node;
              }
            }}
            position={[0, 0.5, 0]}
            camera={{
              active,
            }}
            {...cameraOpts}
          >
            <Entity
              geometry={{
                primitive: 'box',
                width: 0.5,
                height: 0.8,
              }}
            />
          </Entity>
        </Entity>
      : null;
    return (
      <Entity {...{ position }}>
        {person}
        <Entity
          geometry={{
            primitive: 'box',
          }}
        >
          <a-animation
            attribute="position"
            direction="alternate"
            from="0 0 0"
            to="0 0.3 0"
            repeat="0"
          />
        </Entity>
      </Entity>
    );
  }
}
