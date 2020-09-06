import React from 'react';
import styled from 'styled-components';
import { UnstyledUl } from '../styles/mixins';
import { Box } from './common/Box';

export default function InfoPanel() {
  return (
    <InfoList>
      <InfoBox>
        <Heading2>Keyboard controls</Heading2>
        <KeyboardList>
          <li>
            <Code>[Mouse Move]</Code> Change camera position - <Code>[L]</Code> Lock camera position
          </li>
          <li>
            <Code>[C]</Code> Center and lock camera position
          </li>
          <li>
            <Code>[Up/Down or W/S]</Code> Change speed - <Code>[Left/Right or A/D]</Code> Change
            rotation
          </li>
          <li>
            <Code>[H]</Code> Toggle cursor - <Code>[F11]</Code> Toggle fullscreen
          </li>
        </KeyboardList>
      </InfoBox>

      <InfoBox>
        <Heading2>About</Heading2>
        <p>Barry Martin&apos;s Hopalong Orbits Visualizer</p>
        <br />
        <p>These orbits are generated iterating this simple formula:</p>
        <p>
          <CodeRow>(x, y) -&gt; (y - sign(x)*sqrt(abs(b*x - c)), a -x )</CodeRow>
        </p>
        <p>
          where a, b, c are random parameters. This is known as the &apos;Hopalong Attractor&apos;.
        </p>
        <br />
        <p>
          <span>This is a </span>
          <a href="http://www.chromeexperiments.com/detail/webgl-attractors-trip" {...externalLink}>
            Chrome Experiment
          </a>
        </p>
        <p>
          <span>3D rendering is done using WebGL and </span>
          <a href="http://github.com/mrdoob/three.js" {...externalLink}>
            three.js
          </a>
        </p>
        <hr />
        <p>
          <span>Originally created by </span>
          <a href="https://iacopoapps.appspot.com/hopalongwebgl/" {...externalLink}>
            Iacopo Sassarini
          </a>
        </p>
        <p>
          <span>Updated and modernised by </span>
          <a href="https://samleatherdale.github.io" {...externalLink}>
            Sam Leatherdale
          </a>
        </p>
      </InfoBox>
    </InfoList>
  );
}
const externalLink = {
  target: '_blank',
  rel: 'noopener',
};
const KeyboardList = styled(UnstyledUl)`
  > * + * {
    margin-top: 2px;
  }
`;
const InfoList = styled.article`
  > * + * {
    margin-top: 24px;
  }
`;
const Heading2 = styled.h2`
  margin: 0 0 8px;
  font-size: 24px;
`;
const InfoBox = styled(Box)`
  p,
  li {
    line-height: 1.5;
  }
`;
const Code = styled.code`
  display: inline-block;
  background-color: black;
  padding: 4px 8px;
  border-radius: 4px;
`;
const CodeRow = styled(Code)`
  margin: 8px 0;
`;
