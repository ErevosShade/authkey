import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
import { deriveKey, encryptData, decryptData } from './crypto';

interface StoredCredential {
  credentialID: string;
  publicKey: string;
  publicKeyAlgorithm: number;
  encryptedData: {
    iv: string;
    data: string;
  };
}

function arrayBufferToBase64String(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
  const base64 = base64URLString
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLength, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// Fixed DER signature to raw format converter
function derSignatureToRaw(derSignature: ArrayBuffer): ArrayBuffer {
  const der = new Uint8Array(derSignature);
  
  // Parse DER format: SEQUENCE { r INTEGER, s INTEGER }
  if (der[0] !== 0x30) {
    throw new Error('Invalid DER signature format');
  }
  
  const totalLength = der[1];
  if (totalLength + 2 !== der.length) {
    throw new Error('Invalid DER signature length');
  }
  
  let offset = 2; // Skip SEQUENCE tag and length
  
  // Parse r
  if (der[offset] !== 0x02) {
    throw new Error('Invalid DER signature: expected INTEGER for r');
  }
  offset++;
  const rLength = der[offset];
  offset++;
  
  // Handle negative numbers (leading 0x00 byte)
  let rStart = offset;
  let rActualLength = rLength;
  if (der[rStart] === 0x00 && rLength > 1) {
    rStart++;
    rActualLength--;
  }
  
  const r = der.slice(rStart, rStart + rActualLength);
  offset += rLength;
  
  // Parse s  
  if (der[offset] !== 0x02) {
    throw new Error('Invalid DER signature: expected INTEGER for s');
  }
  offset++;
  const sLength = der[offset];
  offset++;
  
  // Handle negative numbers (leading 0x00 byte)
  let sStart = offset;
  let sActualLength = sLength;
  if (der[sStart] === 0x00 && sLength > 1) {
    sStart++;
    sActualLength--;
  }
  
  const s = der.slice(sStart, sStart + sActualLength);
  
  // Pad to 32 bytes for P-256
  const padTo32Bytes = (bytes: Uint8Array): Uint8Array => {
    if (bytes.length === 32) return bytes;
    if (bytes.length > 32) {
      // This shouldn't happen for P-256, but handle it just in case
      return bytes.slice(bytes.length - 32);
    }
    
    const padded = new Uint8Array(32);
    padded.set(bytes, 32 - bytes.length);
    return padded;
  };
  
  const rPadded = padTo32Bytes(r);
  const sPadded = padTo32Bytes(s);
  
  // Concatenate r and s for raw format
  const rawSignature = new Uint8Array(64);
  rawSignature.set(rPadded, 0);
  rawSignature.set(sPadded, 32);
  
  return rawSignature.buffer;
}

export const registerUser = async (userId: string, passphrase: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate registration options 
    const challengeArray = window.crypto.getRandomValues(new Uint8Array(32));
    const optionsJSON: PublicKeyCredentialCreationOptionsJSON = {
      challenge: arrayBufferToBase64String(challengeArray),
      rp: {
        name: 'AuthKey Extension',
        id: chrome.runtime.id // Add the RP ID for consistency
      },
      user: {
        id: arrayBufferToBase64String(new TextEncoder().encode(userId)),
        name: userId,
        displayName: userId,
      },
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7, // ES256
        },
        {
          type: 'public-key',
          alg: -257, // RS256
        }
      ],
      timeout: 60000,
      attestation: 'none', // Changed from 'direct' to 'none' for better compatibility
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    };

    // Start registration process
    const credential = await startRegistration({ optionsJSON });
    console.log('Got registration response:', credential);

    if (!credential.response.publicKey) {
      throw new Error('No public key in registration response');
    }

    // Store the credential data with algorithm info
    const credentialData: StoredCredential = {
      credentialID: credential.id,
      publicKey: credential.response.publicKey,
      publicKeyAlgorithm: credential.response.publicKeyAlgorithm || -7, // Default to ES256
      encryptedData: await encryptData(JSON.stringify({
        id: credential.id,
        type: credential.type,
        response: credential.response,
        rawId: credential.rawId
      }), await deriveKey(passphrase))
    };

    // Store in Chrome extension storage
    await chrome.storage.local.set({ [`credential_${userId}`]: credentialData });
    console.log('Stored credential data:', credentialData);

    return { 
      success: true, 
      message: 'WebAuthn registration successful!' 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Registration failed: ' + (error instanceof Error ? error.message : String(error))
    };
  }
};

export const authenticateUser = async (userId: string, passphrase: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Starting authentication process...');
    
    // Retrieve stored credential
    const result = await chrome.storage.local.get(`credential_${userId}`);
    const storedCredential: StoredCredential = result[`credential_${userId}`];
    
    if (!storedCredential) {
      throw new Error('No credential found for this user');
    }
    console.log('Retrieved stored credential');

    // Generate authentication options
    const challengeArray = window.crypto.getRandomValues(new Uint8Array(32));
    const challenge = arrayBufferToBase64String(challengeArray);
    const optionsJSON: PublicKeyCredentialRequestOptionsJSON = {
      challenge,
      rpId: chrome.runtime.id, // Add RP ID for consistency
      allowCredentials: [{
        id: storedCredential.credentialID,
        type: 'public-key',
        transports: ['internal'], // Specify transport for platform authenticator
      }],
      timeout: 60000,
      userVerification: 'preferred',
    };

    console.log('Starting WebAuthn authentication...');
    const assertion = await startAuthentication({ optionsJSON });
    console.log('Got assertion response:', assertion);

    try {
      // Get client data
      const clientDataBuffer = base64URLStringToBuffer(assertion.response.clientDataJSON);
      const clientDataJSON = new TextDecoder().decode(clientDataBuffer);
      const clientData = JSON.parse(clientDataJSON);
      
      // Decrypt the stored credential data using the passphrase
      const decryptedData = JSON.parse(
        await decryptData(
          storedCredential.encryptedData,
          await deriveKey(passphrase)
        )
      );
      console.log('Decrypted credential:', {
        type: decryptedData.type,
        publicKeyAlgorithm: storedCredential.publicKeyAlgorithm
      });

      // Verify challenge
      if (clientData.challenge !== challenge) {
        console.error('Challenge mismatch', { expected: challenge, received: clientData.challenge });
        throw new Error('Challenge verification failed');
      }

      // Verify origin
      const expectedOrigin = `chrome-extension://${chrome.runtime.id}`;
      if (clientData.origin !== expectedOrigin) {
        console.error('Origin mismatch', { expected: expectedOrigin, received: clientData.origin });
        throw new Error('Origin verification failed');
      }

      // Verify type
      if (clientData.type !== 'webauthn.get') {
        throw new Error('Invalid client data type');
      }

      // Get authenticator data
      const authData = base64URLStringToBuffer(assertion.response.authenticatorData);
      
      // Create client data hash
      const clientDataHash = await crypto.subtle.digest('SHA-256', clientDataBuffer);

      // Parse authenticator data
      
      const flagsBuf = new Uint8Array(authData.slice(32, 33));
      const flags = {
        up: !!(flagsBuf[0] & 0x01), // User Present
        uv: !!(flagsBuf[0] & 0x04), // User Verified
        be: !!(flagsBuf[0] & 0x02), // Backup Eligibility
        bs: !!(flagsBuf[0] & 0x08), // Backup State
        at: !!(flagsBuf[0] & 0x40), // Attested Credential Data
        ed: !!(flagsBuf[0] & 0x80), // Extension Data
      };

      console.log('Auth flags:', flags);

      // Verify User Present flag
      if (!flags.up) {
        throw new Error('User not present during authentication');
      }

      // Create signature base (authenticator data + client data hash)
      const signatureBase = new Uint8Array(authData.byteLength + clientDataHash.byteLength);
      signatureBase.set(new Uint8Array(authData));
      signatureBase.set(new Uint8Array(clientDataHash), authData.byteLength);

      // Import the public key
      const spkiPublicKey = base64URLStringToBuffer(storedCredential.publicKey);
      
      let publicKey;
      let algorithm;
      
      if (storedCredential.publicKeyAlgorithm === -7) {
        // ES256 (ECDSA with P-256)
        algorithm = {
          name: 'ECDSA',
          namedCurve: 'P-256'
        };
        publicKey = await window.crypto.subtle.importKey(
          'spki',
          spkiPublicKey,
          algorithm,
          false,
          ['verify']
        );
      } else if (storedCredential.publicKeyAlgorithm === -257) {
        // RS256 (RSA with SHA-256)
        algorithm = {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        };
        publicKey = await window.crypto.subtle.importKey(
          'spki',
          spkiPublicKey,
          algorithm,
          false,
          ['verify']
        );
      } else {
        throw new Error(`Unsupported public key algorithm: ${storedCredential.publicKeyAlgorithm}`);
      }

      // Get and process the signature
      const signatureBuffer = base64URLStringToBuffer(assertion.response.signature);
      let processedSignature;
      
      if (storedCredential.publicKeyAlgorithm === -7) {
        // For ECDSA, convert DER to raw format
        processedSignature = derSignatureToRaw(signatureBuffer);
      } else {
        // For RSA, use signature as-is
        processedSignature = signatureBuffer;
      }

      // Verify signature
      const verifyAlgorithm = storedCredential.publicKeyAlgorithm === -7 
        ? { name: 'ECDSA', hash: { name: 'SHA-256' } }
        : { name: 'RSASSA-PKCS1-v1_5' };

      const isValid = await window.crypto.subtle.verify(
        verifyAlgorithm,
        publicKey,
        processedSignature,
        signatureBase
      );

      if (!isValid) {
        console.error('Signature verification failed');
        console.error('Debug info:', {
          signatureBaseLength: signatureBase.length,
          processedSignatureLength: processedSignature.byteLength,
          algorithm: storedCredential.publicKeyAlgorithm,
          flags
        });
        throw new Error('Invalid signature');
      }

      console.log('Signature verified successfully');
      return { 
        success: true, 
        message: 'Authentication successful!' 
      };
    } catch (verifyError) {
      console.error('Verification error:', {
        error: verifyError,
        clientData: assertion.response.clientDataJSON ? 
          JSON.parse(new TextDecoder().decode(base64URLStringToBuffer(assertion.response.clientDataJSON))) : null,
        storedCredentialId: storedCredential.credentialID,
        assertionId: assertion.id,
        authData: assertion.response.authenticatorData ? 
          Array.from(new Uint8Array(base64URLStringToBuffer(assertion.response.authenticatorData))) : null,
      });
      throw verifyError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      message: 'Authentication failed: ' + (error instanceof Error ? error.message : String(error))
    };
  }
};