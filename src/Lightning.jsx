import { Entity } from 'aframe-react';
import React from 'react';
import ReactDOM from 'react-dom';

export default class Lightning extends React.Component {
  state = {
    started: false,
  };
  componentDidMount() {
  }

  flicker = () => {
    const interval = Math.max(Math.min(500, Math.random() * 1000), 6000);
    this.el.setAttribute('light', {
      intensity: 0.8,
    });
    setTimeout(() => {
      this.el.setAttribute('light', {
        intensity: 1,
      });
    }, 150);
    setTimeout(() => {
      this.flicker();
    }, interval);
  };

  startStorm = (el) => {
    if (!this.state.started) {
      console.log('lighting', el);
      this.setState({started: true});
      let lastIntensity = 1;
      setTimeout(() => {
        this.flicker(lastIntensity);
      }, 1000);
    }
    // setTimeout(() => {
    // }, 500);
  }

  render() {
    const { position } = this.props;
    return <Entity
      ref={(component) => {
        const el = ReactDOM.findDOMNode(component);
        if (component && !this.el) {
          this.el = el;
          this.startStorm(this.el);
        }
      }}
      position={position}
      light={{
        intensity: 1,
      }} />;
  }
}
