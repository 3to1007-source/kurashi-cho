// 封筒方式(envelope encryption)の暗号化ユーティリティ。
// DEK(データ暗号鍵)を1本だけ生成し、各ユーザーのパスワード由来のKEKで包む。
// パスワードそのものやハッシュは一切保存しない。

const PBKDF2_ITER = 600000
const enc = new TextEncoder()
const dec = new TextDecoder()

export function bufToB64(buf) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

export function b64ToBuf(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function randomBytes(len) {
  return crypto.getRandomValues(new Uint8Array(len))
}

export async function generateDEK() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}

export async function deriveKEK(password, saltBytes, iterations = PBKDF2_ITER) {
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  )
}

export async function newUserCredential(password) {
  const salt = randomBytes(16)
  const iter = PBKDF2_ITER
  const kek = await deriveKEK(password, salt, iter)
  return { salt, iter, kek }
}

export async function wrapDEK(dek, kek) {
  const iv = randomBytes(12)
  const wrapped = await crypto.subtle.wrapKey('raw', dek, kek, { name: 'AES-GCM', iv })
  return { wrapIv: bufToB64(iv), wrapped: bufToB64(wrapped) }
}

export async function unwrapDEK(wrappedB64, kek, wrapIvB64) {
  const wrapped = b64ToBuf(wrappedB64)
  const iv = b64ToBuf(wrapIvB64)
  // KEKかIVが不正だと復号に失敗し、ここで例外が投げられる(=パスワード相違)。
  return crypto.subtle.unwrapKey(
    'raw',
    wrapped,
    kek,
    { name: 'AES-GCM', iv },
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

// 「この端末を覚えておく」ための端末鍵。人が覚えるパスワードではなく
// 生成時からランダムな鍵なので、PBKDF2による導出は不要。
export async function generateDeviceKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['wrapKey', 'unwrapKey'])
}

export async function exportDeviceKey(key) {
  const raw = await crypto.subtle.exportKey('raw', key)
  return bufToB64(raw)
}

export async function importDeviceKey(rawB64) {
  return crypto.subtle.importKey('raw', b64ToBuf(rawB64), { name: 'AES-GCM' }, false, ['unwrapKey'])
}

export async function encryptJSON(dek, obj) {
  const iv = randomBytes(12)
  const plaintext = enc.encode(JSON.stringify(obj))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dek, plaintext)
  return { iv: bufToB64(iv), data: bufToB64(ciphertext) }
}

export async function decryptJSON(dek, ivB64, dataB64) {
  const iv = b64ToBuf(ivB64)
  const ciphertext = b64ToBuf(dataB64)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, dek, ciphertext)
  return JSON.parse(dec.decode(plaintext))
}

export { PBKDF2_ITER }
