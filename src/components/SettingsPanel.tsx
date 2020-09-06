import React, { useState } from 'react';
import styled from 'styled-components';
import { UnstyledUl } from '../styles/mixins';
import { MenuSettings } from '../types/hopalong';
import Checkbox from './Checkbox';
import Slider from './Slider';

type PropsType = {
  settings: MenuSettings;
  onChange: (settings: MenuSettings) => unknown;
};
export default function SettingsPanel({ settings, onChange }: PropsType) {
  const { speed, rotationSpeed } = settings;
  const NORMALISE_ROTATION_SPEED = 1000;
  const [rotateDir, updateRotateDir] = useState(false);

  const updateSetting = (name: string, value: never) => {
    const newSettings = {
      ...settings,
      [name]: value,
    };
    onChange(newSettings);
  };
  const getRotationSpeed = (s: number, dir: boolean) => {
    return Math.abs(s) * (dir ? -1 : 1);
  };

  return (
    <Root>
      <SettingsList>
        <ListItem>
          <Slider
            min={0}
            max={100}
            label="Speed"
            value={speed}
            onChange={(speed) => onChange({ ...settings, speed })}
          />
        </ListItem>
        <ListItem>
          <Slider
            min={0}
            max={100}
            label="Rotation speed"
            value={Math.floor(Math.abs(rotationSpeed * NORMALISE_ROTATION_SPEED))}
            onChange={(s) =>
              onChange({
                ...settings,
                rotationSpeed: getRotationSpeed(s / NORMALISE_ROTATION_SPEED, rotateDir),
              })
            }
          />
        </ListItem>
        <ListItem>
          <Checkbox
            checked={rotateDir}
            onChange={(dir) => {
              updateRotateDir(dir);
              onChange({ ...settings, rotationSpeed: getRotationSpeed(rotationSpeed, dir) });
            }}
            label="Clockwise rotation"
          />
        </ListItem>
      </SettingsList>
    </Root>
  );
}
const Root = styled.div`
  width: 100%;
  max-width: 320px;
`;
const SettingsList = styled(UnstyledUl)`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
`;
const ListItem = styled.li``;
