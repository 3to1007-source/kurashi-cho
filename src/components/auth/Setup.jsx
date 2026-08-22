import { useState } from 'react'
import { createVault, hasVault } from '../../lib/vault'
import PasswordStrengthMeter from '../common/PasswordStrengthMeter'
import styles from './Auth.module.css'

export default function Setup({ onDone, onHaveVault }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const canSubmit = id.trim().length > 0 && password.length >= 8 && password === confirm && agree && !busy

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (hasVault()) {
      onHaveVault()
      return
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上にしてください。')
      return
    }
    if (password !== confirm) {
      setError('確認用パスワードが一致しません。')
      return
    }
    if (!agree) {
      setError('注意事項への同意が必要です。')
      return
    }

    setBusy(true)
    try {
      const { vault, dek, data } = await createVault({ id: id.trim(), password })
      onDone({ vault, dek, data, user: id.trim() })
    } catch {
      setError('帳面の作成に失敗しました。もう一度お試しください。')
      setBusy(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div>
        <h1 className={styles.title}>暮らし帳</h1>
        <p className={styles.subtitle}>
          はじめまして。まずはあなたの帳面を作りましょう。
        </p>
      </div>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="setup-id">ID</label>
          <input id="setup-id" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
        </div>
        <div className={styles.field}>
          <label htmlFor="setup-pw">パスワード(8文字以上)</label>
          <input
            id="setup-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {password.length > 0 && <PasswordStrengthMeter password={password} />}
        </div>
        <div className={styles.field}>
          <label htmlFor="setup-pw2">パスワード(確認)</label>
          <input
            id="setup-pw2"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <label className={styles.consent}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>パスワードはこの端末に保存されません。忘れると帳面を開けなくなり、復旧できないことを理解しました。</span>
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.primary} type="submit" disabled={!canSubmit}>
          {busy ? '作成しています…' : '帳面を作る'}
        </button>
      </form>
    </div>
  )
}
