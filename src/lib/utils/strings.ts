/**
 * Generates a random alphanumerical string.
 * 
 * @param length Length of the string which will be generated.
 * @returns Random string.
 */
export function generateRandomString(length: number) {
   const availableChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let randomString = '';

   for (let i = 0; i < length; i++) {
      const randomCharIndex = Math.floor(Math.random() * availableChars.length);
      randomString += availableChars.charAt(randomCharIndex);
   }

   return randomString;
}