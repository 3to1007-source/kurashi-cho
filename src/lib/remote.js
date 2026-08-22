// Supabase(無料枠のPostgreSQL)への同期レイヤー。
// サーバー側には暗号文(vaultのpayload)しか渡らない。設定がなければ何もしない=ローカルのみで動く。

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function isRemoteConfigured() {
  return Boolean(url && anonKey)
}

let client = null
function getClient() {
  if (!isRemoteConfigured()) return null
  if (!client) client = createClient(url, anonKey)
  return client
}

export async function fetchRemoteVault(bookId) {
  const supabase = getClient()
  if (!supabase || !bookId) return null
  const { data, error } = await supabase.from('vaults').select('payload').eq('id', bookId).maybeSingle()
  if (error) throw error
  return data ? data.payload : null
}

export async function pushRemoteVault(bookId, vault) {
  const supabase = getClient()
  if (!supabase || !bookId) return
  const { error } = await supabase
    .from('vaults')
    .upsert({ id: bookId, payload: vault, updated_at: new Date(vault.updatedAt).toISOString() })
  if (error) throw error
}

export function subscribeRemote(bookId, onChange) {
  const supabase = getClient()
  if (!supabase || !bookId) return () => {}

  const channel = supabase
    .channel(`vaults-${bookId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vaults', filter: `id=eq.${bookId}` },
      (payload) => {
        if (payload.new && payload.new.payload) onChange(payload.new.payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
