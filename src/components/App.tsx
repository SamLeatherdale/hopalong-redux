import React, { useEffect, useState } from 'react';
import { throttle } from 'lodash';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Menu from './Menu';
import Toolbar from './Toolbar';
import WebGLStats from './WebGLStats';

type PropsType = {
  stats: Stats;
};

export default function App({ stats }: PropsType) {
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
    hideTimeout = window.setTimeout(hideToolbar, 3000);
  };

  useEffect(() => {
    document.addEventListener('mousemove', showToolbar);
    document.addEventListener('touchmove', showToolbar);
    setToolbarTimeout();
  });

  const toolbar = (
    <Toolbar
      menuOpen={menuOpen}
      statsOpen={statsOpen}
      updateMenuOpen={() => updateMenuOpen(invertCurrent)}
      updateStatsOpen={() => updateStatsOpen(invertCurrent)}
    />
  );

  return (
    <>
      <motion.div
        animate={{
          opacity: toolbarVisible ? 1 : 0,
        }}
      >
        {!menuOpen && <ToolbarWrap>{toolbar}</ToolbarWrap>}
      </motion.div>
      <MenuBg open={menuOpen}>
        {toolbar}
        <Menu />
      </MenuBg>
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
`;
const StatsBg = styled.div<{ open: boolean }>`
  position: absolute;
  display: ${({ open }) => (open ? 'block' : 'none')};
  z-index: ${zIndexStats};
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;
