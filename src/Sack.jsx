import React, { Component } from "react";
import { Entity } from "aframe-react";

export default class Sack extends Component {
  static propTypes = {
    player1: React.PropTypes.object,
    player2: React.PropTypes.object,
  };
  render() {
    const { children, position, rotation } = this.props;
    return (
      <Entity {...{ position, rotation }}>
        {children}
      </Entity>
    );
  }
}
