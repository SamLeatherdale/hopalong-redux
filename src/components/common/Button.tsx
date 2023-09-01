import styled from 'styled-components';
import { UnstyledButton } from '../../styles/mixins';

export const Button = styled(UnstyledButton).attrs(({ type }) => ({
  type: type || 'button',
}))<{ fullWidth?: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  width: ${({ fullWidth }) => fullWidth && '100%'};

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

const iconButtonSize = 32;
export const IconButton = styled(Button)`
  width: ${iconButtonSize}px;
  height: ${iconButtonSize}px;
  font-size: 24px;
  padding: 4px;
`;
