import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { useId } from '../../util/hooks';
import Input from './Input';

type PropsType = {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => unknown;
};
export default function Slider({ value, min, max, label, onChange }: PropsType) {
  const id = useId();
  const doChange = (e: ChangeEvent<HTMLInputElement>) => onChange(numerify(e.currentTarget.value));
  return (
    <Root>
      <Label htmlFor={id}>{label}</Label>
      <InputRow>
        <RangeInput type="range" value={value} min={min} max={max} onChange={doChange} />
        <NumberInput id={id} type="number" value={stringify(value)} min={min} onChange={doChange} />
      </InputRow>
    </Root>
  );
}
function stringify(value: number): string {
  return value.toString();
}
function numerify(value: string): number {
  const int = parseInt(value, 10);
  return isNaN(int) || value === '' ? 0 : int;
}
const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Label = styled.label`
  text-align: center;
  color: white;
  font-size: 18px;
  margin-bottom: 8px;
`;
const InputRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;
const RangeInput = styled.input`
  flex: 1 1 auto;
`;
const NumberInput = styled(Input)`
  width: 45px;
  margin-left: 8px;
`;
