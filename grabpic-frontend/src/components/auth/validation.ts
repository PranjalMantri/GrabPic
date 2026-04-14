export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>> & {
  form?: string;
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>> & {
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateEmail(value: string) {
  const email = value.trim();

  if (!email) {
    return "Email is required";
  }

  if (!emailPattern.test(email)) {
    return "Enter a valid email address";
  }

  return "";
}

export function validatePassword(value: string) {
  if (!value) {
    return "Password is required";
  }

  return "";
}

export function validateLogin(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateRegister(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const name = values.name.trim();
  const emailError = validateEmail(values.email);

  if (!name) {
    errors.name = "Name is required";
  } else if (name.length < 2) {
    errors.name = "Name should be at least 2 characters";
  }

  if (emailError) errors.email = emailError;

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password should be at least 8 characters";
  } else if (!strongPasswordPattern.test(values.password)) {
    errors.password = "Use uppercase, lowercase, and a number";
  }

  return errors;
}