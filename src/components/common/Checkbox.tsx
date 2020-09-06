import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { useId } from '../../util/hooks';

type PropsType = {
  checked: boolean;
  onChange: (checked: boolean) => unknown;
  label: string;
  inputSize?: number;
};
export default function Checkbox({ label, checked, onChange }: PropsType) {
  const id = useId();
  const doChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.checked);
  return (
    <InputRow>
      <Label htmlFor={id}>{label}</Label>
      <CheckboxInput id={id} type="checkbox" checked={checked} onChange={doChange} />
    </InputRow>
  );
}

const InputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const Label = styled.label`
  flex: 1 1 auto;
  text-align: center;
  color: white;
  font-size: 18px;
`;
const CheckboxInput = styled.input`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
`;
