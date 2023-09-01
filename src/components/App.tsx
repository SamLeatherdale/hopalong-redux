import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { throttle } from 'lodash';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { OnSettingsChange, Settings } from '../types/hopalong';
import Menu from './Menu';
import Toolbar from './Toolbar';
import WebGLStats from './WebGLStats';

type PropsType = {
  stats: Stats;
  settings: Settings;
  onCenter: () => unknown;
  onSettingsChange: OnSettingsChange<Settings>;
  onReset: () => unknown;
};

export default function App({ stats, settings, onSettingsChange, onCenter, onReset }: PropsType) {
  const [toolbarVisible, updateToolbarVisible] = useState(true);
  const [menuOpen, updateMenuOpen] = useState(false);
  const [statsOpen, updateStatsOpen] = useState(false);
  const invertCurrent = (value) => !value;
  let hideTimeout: number;

  const showToolbar = throttle(() => {
    updateToolbarVisible(true);
    window.clearTimeout(hideTimeout);
    setToolbarTimeout();
  }, 250);
  const hideToolbar = () => updateToolbarVisible(false);
  const setToolbarTimeout = () => {
    hideTimeout = window.setTimeout(hideToolbar, 2000);
  };

  useEffect(() => {
    document.addEventListener('mousemove', showToolbar);
    document.addEventListener('touchmove', showToolbar);
    setToolbarTimeout();
  });

  const { mouseLocked, isPlaying, ...menuSettings } = settings;

  const toolbar = (
    <Toolbar
      menuOpen={menuOpen}
      statsOpen={statsOpen}
      mouseLocked={mouseLocked}
      isPlaying={isPlaying}
      updateMenuOpen={() => updateMenuOpen(invertCurrent)}
      updateStatsOpen={() => updateStatsOpen(invertCurrent)}
      updateMouseLocked={() => onSettingsChange({ mouseLocked: !mouseLocked })}
      updateIsPlaying={() => onSettingsChange({ isPlaying: !isPlaying })}
      onCenter={onCenter}
    />
  );

  return (
    <>
      <PlayerWrap>
        <ReactPlayer url="https://www.youtube.com/watch?v=tKi9Z-f6qX4" playing={isPlaying} />
      </PlayerWrap>
      <motion.div
        animate={{
          opacity: toolbarVisible ? 1 : 0,
        }}
      >
        {!menuOpen && <ToolbarWrap>{toolbar}</ToolbarWrap>}
      </motion.div>
      {menuOpen && (
        <MenuBg open={menuOpen}>
          {toolbar}
          <Menu settingsProps={{ settings: menuSettings, onChange: onSettingsChange, onReset }} />
        </MenuBg>
      )}
      <StatsBg open={statsOpen}>
        <WebGLStats stats={stats} />
      </StatsBg>
    </>
  );
}
const zIndexMenu = 5;
const zIndexStats = zIndexMenu + 1;
const zIndexToolbar = zIndexMenu + 2;

const ToolbarWrap = styled.div`
  position: absolute;
  z-index: ${zIndexToolbar};
  top: 0;
  left: 0;
`;
const MenuBg = styled.div<{ open: boolean }>`
  position: absolute;
  display: ${({ open }) => (open ? 'block' : 'none')};
  z-index: ${zIndexMenu};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  overflow-y: auto;
`;
const StatsBg = styled.div<{ open: boolean }>`
  position: absolute;
  display: ${({ open }) => (open ? 'block' : 'none')};
  z-index: ${zIndexStats};
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.5);
`;
const PlayerWrap = styled.div`
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;
