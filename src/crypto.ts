// Encode bytes to base64url for safe storage.
function bytesToBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLength);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export function createSalt(length = 16): string {
  const bytes = window.crypto.getRandomValues(new Uint8Array(length));
  return bytesToBase64Url(bytes);
}

// Key derivation function to generate encryption key from passphrase
export async function deriveKey(passphrase: string, salt: string | Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const saltBytes = typeof salt === 'string' ? base64UrlToBytes(salt) : salt;
  const saltBuffer = Uint8Array.from(saltBytes).buffer;
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encryptData(data: string, key: CryptoKey): Promise<{ iv: string; data: string }> {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(data)
  );

  return {
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    data: Array.from(new Uint8Array(encryptedData))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  };
}

// Decrypt data
export async function decryptData(encryptedObj: { iv: string; data: string }, key: CryptoKey): Promise<string> {
  const iv = new Uint8Array(encryptedObj.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const encryptedData = new Uint8Array(encryptedObj.data.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}

// Verify WebAuthn signature
export async function verifySignature(
  publicKey: CryptoKey,
  data: ArrayBuffer,
  signature: ArrayBuffer
): Promise<boolean> {
  try {
    return await window.crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      publicKey,
      signature,
      data
    );
  } catch (err) {
    console.error('Signature verification failed:', err);
    return false;
  }
}
