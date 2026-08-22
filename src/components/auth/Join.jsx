import { useState } from 'react'
import { loginByBookId } from '../../lib/vault'
import styles from './Auth.module.css'

export default function Join({ onDone, onBack }) {
  const [bookId, setBookId] = useState('')
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { vault, dek, data } = await loginByBookId({ bookId, id: id.trim(), password })
      onDone({ vault, dek, data, user: id.trim() })
    } catch (err) {
      setError(err.message || '開けませんでした。')
      setBusy(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div>
        <h1 className={styles.title}>暮らし帳</h1>
        <p className={styles.subtitle}>
          もう一方の端末で作った帳面を、この端末でも開きます。
        </p>
      </div>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="join-bookid">帳面ID</label>
          <input
            id="join-bookid"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            placeholder="例: K7QX-9F2-M4T"
            autoCapitalize="characters"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="join-id">ID</label>
          <input id="join-id" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
        </div>
        <div className={styles.field}>
          <label htmlFor="join-pw">パスワード</label>
          <input
            id="join-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.primary} type="submit" disabled={busy || !bookId || !id || !password}>
          {busy ? '確認しています…' : '開く'}
        </button>
        <button type="button" className={styles.link} onClick={onBack}>
          戻る
        </button>
      </form>
    </div>
  )
}
