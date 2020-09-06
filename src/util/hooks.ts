//create your forceUpdate hook
import { useState } from 'react';
import { v4 } from 'uuid';

/**
 * https://stackoverflow.com/questions/46240647/react-how-to-force-a-function-component-to-render
 */
export function useForceUpdate() {
  const [, setValue] = useState(0); // integer state
  return () => setValue((value) => ++value); // update the state to force render
}
export function useId() {
  const [id] = useState(v4());
  return id;
}
