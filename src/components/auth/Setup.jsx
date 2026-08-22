import { useState } from 'react'
import { createVault, hasVault, buildJoinUrl } from '../../lib/vault'
import { isRemoteConfigured } from '../../lib/remote'
import PasswordStrengthMeter from '../common/PasswordStrengthMeter'
import BookQRCode from '../common/BookQRCode'
import styles from './Auth.module.css'

export default function Setup({ onDone, onHaveVault, onJoin }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState(null)

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
      const { vault, dek, data, bookId } = await createVault({ id: id.trim(), password })
      if (isRemoteConfigured()) {
        setCreated({ vault, dek, data, bookId, user: id.trim() })
      } else {
        onDone({ vault, dek, data, user: id.trim() })
      }
    } catch {
      setError('帳面の作成に失敗しました。もう一度お試しください。')
      setBusy(false)
    }
  }

  if (created) {
    return (
      <div className={styles.screen}>
        <div>
          <h1 className={styles.title}>帳面ができました</h1>
          <p className={styles.subtitle}>
            もう一方の端末のカメラでQRコードを読み取ると、帳面IDが自動で入力されます。読み取れない場合は下の帳面IDを控えて手入力してください。
          </p>
        </div>
        <div className={styles.card}>
          <BookQRCode url={buildJoinUrl(created.bookId)} />
          <div className={styles.field}>
            <label>帳面ID</label>
            <input readOnly value={created.bookId} onFocus={(e) => e.target.select()} />
          </div>
          <button
            type="button"
            className={styles.primary}
            onClick={() => navigator.clipboard?.writeText(created.bookId)}
          >
            コピーする
          </button>
          <button
            type="button"
            className={styles.link}
            onClick={() => onDone({ vault: created.vault, dek: created.dek, data: created.data, user: created.user })}
          >
            わかりました。始める
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <div>
        <h1 className={styles.title}>暮らしの栞</h1>
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
        {isRemoteConfigured() && (
          <button type="button" className={styles.link} onClick={onJoin}>
            すでにある帳面をこの端末でも開く
          </button>
        )}
      </form>
    </div>
  )
}
