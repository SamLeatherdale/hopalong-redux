import React, { FunctionComponent, useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { classes } from '../../styles/utils';

type PropsType = {
  header: string;
};
const Dropdown: FunctionComponent<PropsType> = ({ header, children }) => {
  const [open, updateOpen] = useState(false);
  return (
    <div>
      <Header onClick={() => updateOpen((open) => !open)}>
        <Heading>{header}</Heading>
        <motion.div
          animate={{
            rotate: open ? 90 : 0,
          }}
        >
          <FaChevronRight size={24} />
        </motion.div>
      </Header>
      <Content className={classes({ hide: !open })}>{children}</Content>
    </div>
  );
};
export default Dropdown;

const Header = styled.header`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Heading = styled.h2`
  font-size: 18px;
  margin-right: 8px;
`;

const Content = styled.div`
  margin-top: 16px;
  &.hide {
    display: none;
  }
`;
