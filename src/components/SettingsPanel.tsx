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
  const NORMALISE_SPEED = 4;
  const NORMALISE_ROTATION_SPEED = -2000;
  const NORMALISE_POINTS = 0.001;
  const [isAdvancedValues, toggleAdvancedValues] = useState(false);
  const maxValues = {
    speed: [50 * NORMALISE_SPEED, 100 * NORMALISE_SPEED],
    rotationSpeed: [100, 200],
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

  return (
    <Root>
      <SettingsList>
        <ListItem>
          <Slider
            min={0}
            max={getMaxValues(maxValues.speed)}
            label="Speed"
            value={settings.speed * NORMALISE_SPEED}
            onChange={(speed) =>
              updateSetting({
                speed: speed / NORMALISE_SPEED,
              })
            }
          />
        </ListItem>
        <ListItem>
          <Slider
            min={-getMaxValues(maxValues.rotationSpeed)}
            max={getMaxValues(maxValues.rotationSpeed)}
            label="Rotation speed"
            value={Math.floor(settings.rotationSpeed * NORMALISE_ROTATION_SPEED)}
            onChange={(rotationSpeed) =>
              updateSetting({
                rotationSpeed: rotationSpeed / NORMALISE_ROTATION_SPEED,
              })
            }
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
