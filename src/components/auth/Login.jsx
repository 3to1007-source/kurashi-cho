import { useEffect, useRef, useState } from 'react'
import { login } from '../../lib/vault'
import { LOGIN_FAIL_LIMIT, LOGIN_LOCK_MS } from '../../lib/constants'
import styles from './Auth.module.css'

export default function Login({ onDone }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [failCount, setFailCount] = useState(0)
  const [lockUntil, setLockUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const tickRef = useRef(null)

  useEffect(() => {
    if (lockUntil <= Date.now()) return undefined
    tickRef.current = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(tickRef.current)
  }, [lockUntil])

  const locked = lockUntil > now
  const remainSec = locked ? Math.ceil((lockUntil - now) / 1000) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (locked || busy) return
    setError('')
    setBusy(true)
    try {
      const { vault, dek, data } = await login({ id: id.trim(), password })
      onDone({ vault, dek, data, user: id.trim() })
    } catch {
      const nextFail = failCount + 1
      setFailCount(nextFail)
      setError('IDまたはパスワードが違います。')
      if (nextFail >= LOGIN_FAIL_LIMIT) {
        setLockUntil(Date.now() + LOGIN_LOCK_MS)
        setFailCount(0)
      }
      setBusy(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div>
        <h1 className={styles.title}>暮らしの栞</h1>
        <p className={styles.subtitle}>帳面を開きます。</p>
      </div>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="login-id">ID</label>
          <input id="login-id" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
        </div>
        <div className={styles.field}>
          <label htmlFor="login-pw">パスワード</label>
          <input
            id="login-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && !locked && <p className={styles.error}>{error}</p>}
        {locked && <p className={styles.error}>失敗が続いたため、{remainSec}秒待ってからお試しください。</p>}
        <button className={styles.primary} type="submit" disabled={busy || locked || !id || !password}>
          {busy ? '確認しています…' : '開く'}
        </button>
      </form>
    </div>
  )
}
