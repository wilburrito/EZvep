import { validateProps } from "../../common/types";

export default function validate(values: validateProps) {
  let errors = {} as validateProps;

  if (!values.name) {
    errors.name = "Name is required";
  }
  if (!values.email) {
    errors.email = "Email address is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Email address is invalid";
  }
  if (!values.phoneNumber) {
    errors.phoneNumber = "Number is required";
  }
  if (values.phoneNumber.length < 8) {
    errors.phoneNumber = "Number must be 8 characters";
  }
  //check if number is valid (starts with 8 or 9, and is purely numeric)
  if (!/^[8-9]\d{7}$/.test(values.phoneNumber)) {
    errors.phoneNumber = "Invalid number";
  }
  return errors;
}
