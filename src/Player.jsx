import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Entity } from "aframe-react";
import Shake from "shake.js";
import debounce from "./debounce";

export default class Player extends Component {
  static propTypes = {
    active: React.PropTypes.bool,
    position: React.PropTypes.array,
    rotation: React.PropTypes.array,
    hop: React.PropTypes.func,
    onRotate: React.PropTypes.func,
    onMove: React.PropTypes.func,
    id: React.PropTypes.string
  };

  static defaultProps = {
    active: false
  };

  componentDidMount() {
    if (this.props.active) {
      const { onRotate, onMove } = this.props;
      this.shaker = new Shake({
        threshold: 5,
        timeout: 250
      });
      this.shaker.start();
      window.addEventListener("shake", this.onShakeMove, false);

      this.moveDebounce = debounce(onMove);
      document.addEventListener("keydown", this.onMove);

      let lastRotation = {};
      this.rotating = setInterval(
        () => {
          if (this.camera) {
            const rotation = this.camera.getAttribute("rotation");
            if (
              lastRotation.x !== rotation.x ||
              lastRotation.y !== rotation.y ||
              lastRotation.z !== rotation.z
            ) {
              onRotate({ rotation });
              lastRotation = rotation;
            }
          }
          // get rotation
        },
        120
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.rotating);
    this.shaker.stop();
    window.removeEventListener("shake", this.onShakeMove, false);
    window.removeEventListener("keydown", this.onMove);
  }

  // hop = () => {
  //   const { hop } = this.props;
  //   if (this.camera) {
  //     const rotation = this.camera.getAttribute('rotation');
  //     hop(rotation);
  //   }
  // };

  onShakeMove = () => {
    const { id } = this.props;
    this.moveDebounce(id);
  };

  onMove = ev => {
    const { id } = this.props;
    const keyCode = ev.keyCode;
    if (keyCode === 87) {
      this.moveDebounce(id);
    }
  };

  render() {
    const { active, filled, position, rotation } = this.props;
    const cameraOpts = active ? { "look-controls": "" } : {};
    const person = filled
      ? <Entity position={[0, 2, 0]} {...active ? {} : { rotation }}>
          <Entity
            ref={el => {
              const node = ReactDOM.findDOMNode(el);
              if (el && node) {
                this.camera = node;
              }
            }}
            position={[0, 0.5, 0]}
            camera={{
              active
            }}
            {...cameraOpts}
          >
            <Entity
              geometry={{
                primitive: "box",
                width: 0.25,
                height: 0.4
              }}
            />
          </Entity>
        </Entity>
      : null;
    return (
      <Entity {...{ position }}>
        {person}
      </Entity>
    );
  }
}
