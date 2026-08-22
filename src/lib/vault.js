import {
  bufToB64,
  b64ToBuf,
  generateDEK,
  newUserCredential,
  deriveKEK,
  wrapDEK,
  unwrapDEK,
  encryptJSON,
  decryptJSON,
  generateDeviceKey,
  exportDeviceKey,
  importDeviceKey,
  PBKDF2_ITER,
} from './crypto'
import { VAULT_KEY, BOOK_ID_KEY, DEVICE_KEY_KEY, DEVICE_WRAP_KEY, DEVICE_USER_KEY, emptyData } from './constants'
import { fetchRemoteVault, pushRemoteVault } from './remote'

const AUTH_ERROR = 'IDまたはパスワードが違います。'
const BOOK_ID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ' // 0/O, 1/I/L を除いた紛らわしくない文字

export function loadVaultRaw() {
  const raw = localStorage.getItem(VAULT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveVaultRaw(vault) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
}

export function hasVault() {
  return !!loadVaultRaw()
}

// 他の端末のカメラでQRコードを読み取ったときに開くURL。
// パスワードは含めない(帳面IDのみ)。読み取った側は自分のID・パスワードをその場で入力する。
export function buildJoinUrl(bookId) {
  return `${window.location.origin}${import.meta.env.BASE_URL}?book=${encodeURIComponent(bookId)}`
}

export function getBookId() {
  return localStorage.getItem(BOOK_ID_KEY)
}

function setBookId(id) {
  localStorage.setItem(BOOK_ID_KEY, id)
}

function generateBookId() {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  let s = ''
  for (const b of bytes) s += BOOK_ID_ALPHABET[b % BOOK_ID_ALPHABET.length]
  return `${s.slice(0, 4)}-${s.slice(4, 7)}-${s.slice(7, 10)}`
}

export async function createVault({ id, password }) {
  const dek = await generateDEK()
  const { salt, iter, kek } = await newUserCredential(password)
  const { wrapIv, wrapped } = await wrapDEK(dek, kek)

  const data = emptyData()
  const { iv, data: cipherData } = await encryptJSON(dek, data)

  const vault = {
    v: 1,
    users: [{ id, salt: bufToB64(salt), iter, wrapIv, wrapped }],
    iv,
    data: cipherData,
    updatedAt: Date.now(),
    updatedBy: id,
  }
  const bookId = generateBookId()
  saveVaultRaw(vault)
  setBookId(bookId)
  try {
    await pushRemoteVault(bookId, vault)
  } catch {
    // オフラインや未設定でも、まずはローカルの帳面が作れていればよい。次回の保存時に再送される。
  }
  return { vault, dek, data, bookId }
}

export async function login({ id, password }) {
  const vault = loadVaultRaw()
  if (!vault) throw new Error(AUTH_ERROR)

  const user = vault.users.find((u) => u.id === id)
  if (!user) throw new Error(AUTH_ERROR)

  let dek
  try {
    const kek = await deriveKEK(password, b64ToBuf(user.salt), user.iter)
    dek = await unwrapDEK(user.wrapped, kek, user.wrapIv)
  } catch {
    throw new Error(AUTH_ERROR)
  }

  let data
  try {
    data = await decryptJSON(dek, vault.iv, vault.data)
  } catch {
    throw new Error(AUTH_ERROR)
  }

  return { vault, dek, data }
}

export async function loginByBookId({ bookId, id, password }) {
  const normalizedId = bookId.trim().toUpperCase()
  let vault
  try {
    vault = await fetchRemoteVault(normalizedId)
  } catch {
    throw new Error('帳面に接続できませんでした。通信状況を確認してください。')
  }
  if (!vault) throw new Error('その帳面IDは見つかりません。')

  const user = vault.users.find((u) => u.id === id)
  if (!user) throw new Error(AUTH_ERROR)

  let dek
  try {
    const kek = await deriveKEK(password, b64ToBuf(user.salt), user.iter)
    dek = await unwrapDEK(user.wrapped, kek, user.wrapIv)
  } catch {
    throw new Error(AUTH_ERROR)
  }

  let data
  try {
    data = await decryptJSON(dek, vault.iv, vault.data)
  } catch {
    throw new Error(AUTH_ERROR)
  }

  saveVaultRaw(vault)
  setBookId(normalizedId)
  return { vault, dek, data }
}

export async function addUser({ vault, dek, id, password }) {
  if (vault.users.some((u) => u.id === id)) {
    throw new Error('そのIDはすでに使われています。')
  }
  const { salt, iter, kek } = await newUserCredential(password)
  const { wrapIv, wrapped } = await wrapDEK(dek, kek)
  const nextVault = {
    ...vault,
    users: [...vault.users, { id, salt: bufToB64(salt), iter, wrapIv, wrapped }],
  }
  saveVaultRaw(nextVault)
  const bookId = getBookId()
  if (bookId) {
    try {
      await pushRemoteVault(bookId, nextVault)
    } catch {
      // 次の保存時に再送される。追加自体はローカルに反映済み。
    }
  }
  return nextVault
}

export async function persist({ vault, dek, data, by }) {
  const { iv, data: cipherData } = await encryptJSON(dek, data)
  const nextVault = {
    ...vault,
    iv,
    data: cipherData,
    updatedAt: Date.now(),
    updatedBy: by,
  }
  saveVaultRaw(nextVault)
  return nextVault
}

// 「この端末を覚えておく」: DEKを端末固有の鍵で包んでlocalStorageに保存する。
// 無操作ロックや「帳面を閉じる」で forgetDevice() されるまで、次回起動時の
// パスワード入力を省略できる。
export async function rememberDevice({ dek, user }) {
  const deviceKey = await generateDeviceKey()
  const rawB64 = await exportDeviceKey(deviceKey)
  const { wrapIv, wrapped } = await wrapDEK(dek, deviceKey)
  localStorage.setItem(DEVICE_KEY_KEY, rawB64)
  localStorage.setItem(DEVICE_WRAP_KEY, JSON.stringify({ wrapIv, wrapped }))
  localStorage.setItem(DEVICE_USER_KEY, user)
}

export function forgetDevice() {
  localStorage.removeItem(DEVICE_KEY_KEY)
  localStorage.removeItem(DEVICE_WRAP_KEY)
  localStorage.removeItem(DEVICE_USER_KEY)
}

export async function tryDeviceLogin() {
  const rawB64 = localStorage.getItem(DEVICE_KEY_KEY)
  const wrapJson = localStorage.getItem(DEVICE_WRAP_KEY)
  const user = localStorage.getItem(DEVICE_USER_KEY)
  if (!rawB64 || !wrapJson || !user) return null

  const vault = loadVaultRaw()
  if (!vault) return null

  try {
    const { wrapIv, wrapped } = JSON.parse(wrapJson)
    const deviceKey = await importDeviceKey(rawB64)
    const dek = await unwrapDEK(wrapped, deviceKey, wrapIv)
    const data = await decryptJSON(dek, vault.iv, vault.data)
    return { vault, dek, data, user }
  } catch {
    forgetDevice()
    return null
  }
}

export async function syncToRemote(vault) {
  const bookId = getBookId()
  if (!bookId) return
  await pushRemoteVault(bookId, vault)
}

// リモートの方が新しければローカルへ取り込む(後勝ち)。リモートが無ければnullを返す。
export async function pullAndMerge({ dek, localVault }) {
  const bookId = getBookId()
  if (!bookId) return null

  const remoteVault = await fetchRemoteVault(bookId)
  if (!remoteVault) return null
  if (localVault && remoteVault.updatedAt <= localVault.updatedAt) return null

  const data = await decryptJSON(dek, remoteVault.iv, remoteVault.data)
  saveVaultRaw(remoteVault)
  return { vault: remoteVault, data }
}

export async function decryptVaultData(dek, vault) {
  return decryptJSON(dek, vault.iv, vault.data)
}

export async function reload({ dek }) {
  const vault = loadVaultRaw()
  if (!vault) throw new Error('保管庫が見つかりません。')
  const data = await decryptJSON(dek, vault.iv, vault.data)
  return { vault, data }
}

export function exportDataJSON(data) {
  return JSON.stringify(data, null, 2)
}

export { PBKDF2_ITER }
