import React, { useState } from 'react';
import styled from 'styled-components';
import { UnstyledButton } from '../styles/mixins';
import { classes } from '../styles/utils';
import InfoPanel from './InfoPanel';

enum Tabs {
  SETTINGS = 'Settings',
  ABOUT = 'About',
}
export default function Menu() {
  const tabs = [Tabs.SETTINGS, Tabs.ABOUT];
  const [currentTab, updateCurrentTab] = useState(Tabs.ABOUT);
  return (
    <Root>
      <TabBar>
        {tabs.map((tab) => (
          <Tab key={tab} className={classes({ active: currentTab === tab })} onClick={() => updateCurrentTab(tab)}>
            {tab}
          </Tab>
        ))}
      </TabBar>
      <Content>{currentTab === Tabs.ABOUT && <InfoPanel />}</Content>
    </Root>
  );
}
const Root = styled.div`
  padding: 0 16px;
  font-size: 13px;
  font-weight: bold;
`;
const TabBar = styled.header`
  display: flex;
  justify-content: center;
`;
const Tab = styled(UnstyledButton)`
  padding: 8px 16px;
  font-size: 16px;
  border: 1px solid white;
  color: white;

  &:hover,
  &.active {
    background-color: white;
    color: black;
  }
`;
const Content = styled.main`
  margin-top: 40px;
`;
