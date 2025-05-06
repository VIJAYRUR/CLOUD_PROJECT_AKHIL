import crypto from 'crypto-js';

/**
 * Calculate the SECRET_HASH value required by Cognito when a client secret is configured
 * @param {string} username - The username (email)
 * @param {string} clientId - The Cognito app client ID
 * @param {string} clientSecret - The Cognito app client secret
 * @returns {string} - The calculated SECRET_HASH
 */
export const calculateSecretHash = (username, clientId, clientSecret) => {
  try {
    // The message is username + clientId
    const message = username + clientId;
    
    // Create a hash using HMAC SHA256
    const hashObj = crypto.HmacSHA256(message, clientSecret);
    
    // Convert to Base64
    const hashBase64 = crypto.enc.Base64.stringify(hashObj);
    
    console.log('Generated SECRET_HASH for', username);
    return hashBase64;
  } catch (error) {
    console.error('Error calculating SECRET_HASH:', error);
    return undefined;
  }
};
