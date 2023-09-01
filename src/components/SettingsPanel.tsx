import React, { useState } from 'react';
import styled from 'styled-components';
import { UnstyledUl } from '../styles/mixins';
import { MenuSettings } from '../types/hopalong';
import { Button } from './common/Button';
import Checkbox from './common/Checkbox';
import Dropdown from './common/Dropdown';
import Slider from './common/Slider';

export type SettingsPanelProps = {
  settings: MenuSettings;
  onChange: (settings: Partial<MenuSettings>) => unknown;
  onReset: () => unknown;
};
export default function SettingsPanel({ settings, onChange, onReset }: SettingsPanelProps) {
  const NORMALISE_ROTATION_SPEED = 1000;
  const NORMALISE_POINTS = 0.001;
  const [isAdvancedValues, toggleAdvancedValues] = useState(false);
  const rotateDir = settings.rotationSpeed < 0;
  const maxValues = {
    speed: [50, 100],
    rotationSpeed: [50, 100],
    cameraFov: [120, 180],
    points: [50, 100],
    subsetCount: [10, 20],
    levelCount: [10, 20],
  };
  const getMaxValues = ([regular, advanced]: number[]): number => {
    return isAdvancedValues ? advanced : regular;
  };

  const updateSetting = (newSettings: Partial<MenuSettings>) => {
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
            max={getMaxValues(maxValues.speed)}
            label="Speed"
            value={settings.speed}
            onChange={(speed) => updateSetting({ speed })}
          />
        </ListItem>
        <ListItem>
          <Slider
            min={0}
            max={getMaxValues(maxValues.rotationSpeed)}
            label="Rotation speed"
            value={Math.floor(Math.abs(settings.rotationSpeed * NORMALISE_ROTATION_SPEED))}
            onChange={(rotationSpeed) =>
              updateSetting({
                rotationSpeed: getRotationSpeed(
                  rotationSpeed / NORMALISE_ROTATION_SPEED,
                  rotateDir
                ),
              })
            }
          />
        </ListItem>
        <ListItem>
          <Checkbox
            checked={rotateDir}
            onChange={(dir) => {
              updateSetting({ rotationSpeed: getRotationSpeed(settings.rotationSpeed, dir) });
            }}
            label="Clockwise rotation"
          />
        </ListItem>
        <ListItem>
          <Slider
            min={0}
            max={getMaxValues(maxValues.cameraFov)}
            label="Camera FOV"
            value={settings.cameraFov}
            onChange={(fov) =>
              updateSetting({
                cameraFov: fov,
              })
            }
          />
        </ListItem>
      </SettingsList>
      <Button fullWidth onClick={onReset}>
        Reset Defaults
      </Button>
      <Dropdown header="Advanced Settings">
        <BorderedSettingsList>
          <ListItem>
            <Slider
              min={1}
              max={getMaxValues(maxValues.points)}
              label="Particle count (thousands)"
              value={Math.floor(settings.pointsPerSubset * NORMALISE_POINTS)}
              onChange={(points) =>
                updateSetting({
                  pointsPerSubset: points / NORMALISE_POINTS,
                })
              }
            />
          </ListItem>
          <ListItem>
            <Slider
              min={1}
              max={getMaxValues(maxValues.subsetCount)}
              label="Subset count"
              value={settings.subsetCount}
              onChange={(n) =>
                updateSetting({
                  subsetCount: n,
                })
              }
            />
          </ListItem>
          <ListItem>
            <Slider
              min={1}
              max={getMaxValues(maxValues.levelCount)}
              label="Level count"
              value={settings.levelCount}
              onChange={(n) =>
                updateSetting({
                  levelCount: n,
                })
              }
            />
          </ListItem>
          <ListItem title="Increases maximums for sliders">
            <Checkbox
              checked={isAdvancedValues}
              onChange={toggleAdvancedValues}
              label="🤯 Increase all limits"
            />
          </ListItem>
        </BorderedSettingsList>
      </Dropdown>
    </Root>
  );
}
const Root = styled.div`
  width: 100%;
  max-width: 320px;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 42px;
`;
const SettingsList = styled(UnstyledUl)`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
`;
const BorderedSettingsList = styled(SettingsList)`
  padding: 16px 8px;
  border: 1px solid white;
  border-radius: 4px;
`;
const ListItem = styled.li``;
