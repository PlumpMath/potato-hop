import React, { Component } from "react";
import { Entity } from "aframe-react";

export default class Sack extends Component {
  render() {
    const { children, position, rotation } = this.props;
    return (
      <Entity {...{ position, rotation }}>
        {children}
      </Entity>
    );
  }
}
