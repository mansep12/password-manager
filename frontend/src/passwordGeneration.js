export function generateRandomPassword(length) {
  // Define the characters that can be included in the password
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  
  let password = '';
  
  for (let i = 0; i < length; i++) {
    // Randomly select a character from the characters string
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

export default { generateRandomPassword }

