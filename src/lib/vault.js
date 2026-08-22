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
  PBKDF2_ITER,
} from './crypto'
import { VAULT_KEY, emptyData } from './constants'

const AUTH_ERROR = 'IDまたはパスワードが違います。'

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
  saveVaultRaw(vault)
  return { vault, dek, data }
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
