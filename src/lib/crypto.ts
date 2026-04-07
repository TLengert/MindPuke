export interface WrappedKey {
  type: 'master' | 'kinde-id';
  userId?: string;
  key: string; 
  salt: string; 
  iv: string; 
}

export interface MpukeEnvelope {
  metadata: {
    version: number;
    keys: WrappedKey[];
    payloadIv: string; 
  };
  payload: string; 
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateFileKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function deriveKeyFromSecret(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secretKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    secretKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

export async function wrapFileKey(
  fileKey: CryptoKey,
  secret: string,
  type: 'master' | 'kinde-id',
  userId?: string
): Promise<WrappedKey> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const wrappingKey = await deriveKeyFromSecret(secret, salt as any);

  const wrappedBuffer = await window.crypto.subtle.wrapKey(
    'raw',
    fileKey,
    wrappingKey,
    { name: 'AES-GCM', iv: iv as any }
  );

  return {
    type,
    userId,
    key: bufferToBase64(wrappedBuffer),
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer)
  };
}

export async function unwrapFileKey(wrappedData: WrappedKey, secret: string): Promise<CryptoKey> {
  const saltBuf = base64ToBuffer(wrappedData.salt);
  const ivBuf = base64ToBuffer(wrappedData.iv);

  const unwrappingKey = await deriveKeyFromSecret(secret, new Uint8Array(saltBuf));

  return await window.crypto.subtle.unwrapKey(
    'raw',
    base64ToBuffer(wrappedData.key),
    unwrappingKey,
    { name: 'AES-GCM', iv: new Uint8Array(ivBuf) as any },
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMap(fileKey: CryptoKey, data: any): Promise<{ payload: string, iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    fileKey,
    encodedData
  );

  return {
    payload: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer)
  };
}

export async function decryptMap(fileKey: CryptoKey, payloadBase64: string, ivBase64: string): Promise<any> {
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(base64ToBuffer(ivBase64)) as any },
    fileKey,
    base64ToBuffer(payloadBase64)
  );

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonString);
}
