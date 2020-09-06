import React from 'react';
import { FaBars, FaChartArea, FaCompressArrowsAlt, FaExpandArrowsAlt, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import { UnstyledButton } from '../styles/mixins';
import { classes } from '../styles/utils';
import { useForceUpdate } from '../util/hooks';

type PropsType = {
  menuOpen: boolean;
  statsOpen: boolean;
  updateMenuOpen: () => unknown;
  updateStatsOpen: () => unknown;
};
export default function Toolbar({ menuOpen, statsOpen, updateMenuOpen, updateStatsOpen }: PropsType) {
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
        <NavListItem>
          <NavListButton className={classes({ active: menuOpen })} onClick={updateMenuOpen}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </NavListButton>
        </NavListItem>
        <NavListItem>
          <NavListButton className={classes({ active: isFullscreen })} onClick={toggleFullScreen}>
            {isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
          </NavListButton>
        </NavListItem>
        <NavListItem>
          <NavListButton className={classes({ active: statsOpen })} onClick={updateStatsOpen}>
            <FaChartArea />
          </NavListButton>
        </NavListItem>
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
const NavListItem = styled.li`
  &:not(:first-child) {
    margin-left: 8px;
  }
`;
const NavListButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${navListItemSize}px;
  height: ${navListItemSize}px;
  border: 1px solid white;
  border-radius: 4px;
  padding: 4px;
  color: white;
  font-size: 24px;

  &:hover,
  &.active {
    background-color: white;
    color: black;
  }
`;
