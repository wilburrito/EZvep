import { StyledButton } from "./styles";
import { ButtonProps } from "../types";

export const Button = ({ color, children, onClick, htmlType, name }: ButtonProps) => (
  <StyledButton color={color} onClick={onClick} type={htmlType} name={name}>
    {children}
  </StyledButton>
);
