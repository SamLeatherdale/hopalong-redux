import React from 'react';
import { FaBars, FaChartArea, FaExpandArrowsAlt, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import { unstyledButton } from '../styles/mixins';

type PropsType = {
  menuOpen: boolean;
  updateMenuOpen: () => unknown;
  updateStatsOpen: () => unknown;
};
export default function Toolbar({ menuOpen, updateMenuOpen, updateStatsOpen }: PropsType) {
  return (
    <nav>
      <NavList>
        <NavListItem>
          <NavListButton onClick={updateMenuOpen}>{menuOpen ? <FaTimes /> : <FaBars />}</NavListButton>
        </NavListItem>
        <NavListItem>
          <NavListButton onClick={toggleFullScreen}>
            <FaExpandArrowsAlt />
          </NavListButton>
        </NavListItem>
        <NavListItem>
          <NavListButton onClick={updateStatsOpen}>
            <FaChartArea />
          </NavListButton>
        </NavListItem>
      </NavList>
    </nav>
  );
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
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
const NavListButton = styled.button`
  ${unstyledButton};
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
`;
