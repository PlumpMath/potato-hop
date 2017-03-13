import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Entity } from "aframe-react";
import Shake from 'shake.js';

export default class player extends Component {
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

      this.rotating = setInterval(() => {
        if (this.camera) {
          const rotation = this.camera.getAttribute('rotation');
          lastRotation = rotation;
          if (lastRotation.x !== rotation.x || lastRotation.y !== rotation.y || lastRotation.z !== rotation.y) {
            onRotate({rotation});
          }
        }
        // get rotation
      }, 120);
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
  }
  render() {
    const { position, rotation } = this.props;
    return (
      <Entity {...{position, rotation}}>
        <Entity
          geometry={{
            primitive: "box"
          }}
        >
          <Entity
            ref={(el) => {
              const node = ReactDOM.findDOMNode(el);
              if (el && node) {
                this.camera = node;
              }
            }}
            camera={{
              active: true,
              userHeight: 1.6
            }}
            look-controls=""
          />
          <a-animation
            attribute="position"
            direction="alternate"
            from="0 0 0"
            to="0 0.3 0"
            repeat="indefinite"
          />
        </Entity>
      </Entity>
    );
  }
}
