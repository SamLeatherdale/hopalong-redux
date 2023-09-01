import React from 'react';
import {
  FaBars,
  FaChartArea,
  FaCompressArrowsAlt,
  FaCrosshairs,
  FaExpandArrowsAlt,
  FaLock,
  FaLockOpen,
  FaPause,
  FaPlay,
  FaTimes,
} from 'react-icons/fa';
import styled from 'styled-components';
import { IconButton } from './common/Button';
import { classes } from '../styles/utils';
import { useForceUpdate } from '../util/hooks';

type PropsType = {
  menuOpen: boolean;
  statsOpen: boolean;
  mouseLocked: boolean;
  isPlaying: boolean;
  onCenter: () => unknown;
  updateMenuOpen: () => unknown;
  updateStatsOpen: () => unknown;
  updateMouseLocked: () => unknown;
  updateIsPlaying: () => unknown;
};
export default function Toolbar({
  menuOpen,
  statsOpen,
  mouseLocked,
  isPlaying,
  onCenter,
  updateMenuOpen,
  updateStatsOpen,
  updateMouseLocked,
  updateIsPlaying,
}: PropsType) {
  const isFullscreen = !!document.fullscreenElement;

  const forceUpdate = useForceUpdate();
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(forceUpdate);
    } else {
      document.exitFullscreen().then(forceUpdate);
    }
  };

  return (
    <nav>
      <NavList>
        <ListItem>
          <IconButton className={classes({ active: menuOpen })} onClick={updateMenuOpen}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </IconButton>
        </ListItem>
        <ListItem>
          <IconButton className={classes({ active: isFullscreen })} onClick={toggleFullScreen}>
            {isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
          </IconButton>
        </ListItem>
        <ListItem>
          <IconButton className={classes({ active: mouseLocked })} onClick={updateMouseLocked}>
            {mouseLocked ? <FaLock /> : <FaLockOpen />}
          </IconButton>
        </ListItem>
        <ListItem>
          <IconButton className={classes({ active: isPlaying })} onClick={updateIsPlaying}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </IconButton>
        </ListItem>
        <ListItem>
          <IconButton onClick={onCenter}>
            <FaCrosshairs />
          </IconButton>
        </ListItem>
        <ListItem>
          <IconButton
            className={classes({ active: statsOpen, hide: !menuOpen })}
            onClick={updateStatsOpen}
          >
            <FaChartArea />
          </IconButton>
        </ListItem>
      </NavList>
    </nav>
  );
}

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 8px;
`;
const ListItem = styled.li`
  &:not(:first-child) {
    margin-left: 8px;
  }
`;
