import React from 'react';
import {
  FaBars,
  FaChartArea,
  FaCompressArrowsAlt,
  FaCrosshairs,
  FaExpandArrowsAlt,
  FaLock,
  FaLockOpen,
  FaTimes,
} from 'react-icons/fa';
import styled from 'styled-components';
import { UnstyledButton } from '../styles/mixins';
import { classes } from '../styles/utils';
import { useForceUpdate } from '../util/hooks';

type PropsType = {
  menuOpen: boolean;
  statsOpen: boolean;
  mouseLocked: boolean;
  onCenter: () => unknown;
  updateMenuOpen: () => unknown;
  updateStatsOpen: () => unknown;
  updateMouseLocked: () => unknown;
};
export default function Toolbar({
  menuOpen,
  statsOpen,
  mouseLocked,
  onCenter,
  updateMenuOpen,
  updateStatsOpen,
  updateMouseLocked,
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
          <Button className={classes({ active: menuOpen })} onClick={updateMenuOpen}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </Button>
        </ListItem>
        <ListItem>
          <Button className={classes({ active: isFullscreen })} onClick={toggleFullScreen}>
            {isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
          </Button>
        </ListItem>
        <ListItem>
          <Button className={classes({ active: mouseLocked })} onClick={updateMouseLocked}>
            {mouseLocked ? <FaLock /> : <FaLockOpen />}
          </Button>
        </ListItem>
        <ListItem>
          <Button onClick={onCenter}>
            <FaCrosshairs />
          </Button>
        </ListItem>
        <ListItem>
          <Button
            className={classes({ active: statsOpen, hide: !menuOpen })}
            onClick={updateStatsOpen}
          >
            <FaChartArea />
          </Button>
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
const navListItemSize = 32;
const ListItem = styled.li`
  &:not(:first-child) {
    margin-left: 8px;
  }
`;
const Button = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${navListItemSize}px;
  height: ${navListItemSize}px;
  border: 1px solid white;
  border-radius: 4px;
  padding: 4px;
  font-size: 24px;
  &,
  &:focus {
    background-color: transparent;
    color: white;
  }

  &:hover:not(:focus),
  &.active {
    background-color: white;
    color: black;
  }

  &.hide {
    display: none;
  }
`;
