import React from 'react';
import styled from 'styled-components';
import { UnstyledUl } from '../styles/mixins';

export default function InfoPanel() {
  return (
    <InfoList>
      <InfoBox>
        <Heading2>Controls</Heading2>
        <UnstyledUl>
          <li>[Mouse Move] Change camera position - [L] Lock camera position</li>
          <li>[Space] Center and lock camera position</li>
          <li>[Up/Down or W/S] Change speed - [Left/Right or A/D] Change rotation</li>
          <li>[H] Toggle cursor - [F11] Toggle fullscreen</li>
        </UnstyledUl>
      </InfoBox>

      <InfoBox>
        <Heading2>About</Heading2>
        <p>Barry Martin&apos;s Hopalong Orbits Visualizer</p>
        <p>These orbits are generated iterating this simple formula:</p>
        <p>(x, y) -&gt; (y - sign(x)*sqrt(abs(b*x - c)), a -x )</p>
        <p>where a, b, c are random parameters. This is known as the &apos;Hopalong Attractor&apos;.</p>
        <p>
          <span>3D rendering is done using WebGL and </span>
          <a href="http://github.com/mrdoob/three.js" target="_blank" rel="noopener noreferrer">
            three.js
          </a>
        </p>
        <hr />
        This is a <a href="http://www.chromeexperiments.com/detail/webgl-attractors-trip/?f=">Chrome Experiment</a>
      </InfoBox>
    </InfoList>
  );
}
const InfoList = styled.article`
  > * + * {
    margin-top: 32px;
  }
`;
const Heading2 = styled.h2`
  margin: 0 0 8px;
  font-size: 24px;
`;
const InfoBox = styled.section`
  color: #fff;
  background: #121212;
  opacity: 0.8;
  border-radius: 20px;
  padding: 16px;

  p,
  li {
    line-height: 1.5;
  }
`;
