/**
 * Parse a JWT token to extract its payload
 * @param token The JWT token to parse
 * @returns The decoded payload or null if invalid
 */
export default function parseJwt(token: string): any {
  if (!token) return null;
  
  try {
    // Split the token into its parts
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Replace characters for base64 decoding
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode the base64 string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    // Parse the JSON payload
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
} 