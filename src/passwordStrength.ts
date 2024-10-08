export function checkPasswordStrength(password: string): boolean {
  // Return true if the password is less than 20 characters (weak)
  // Return false if the password is 20 characters or longer (not weak)
  return password.length < 20;
}
