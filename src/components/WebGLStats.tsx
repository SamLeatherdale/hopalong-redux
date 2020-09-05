import React, { useEffect, useRef } from 'react';
import Stats from 'stats.js';
import styled from 'styled-components';

export default function WebGLStats({ stats }: { stats: Stats }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.appendChild(stats.dom);
  }, []);

  return <StatsReset ref={ref} />;
}
const StatsReset = styled.div`
  > * {
    position: static !important;
  }
`;
