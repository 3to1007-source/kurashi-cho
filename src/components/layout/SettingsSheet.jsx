import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { addUser, exportDataJSON, getBookId, buildJoinUrl } from '../../lib/vault'
import { todayStr } from '../../lib/constants'
import BookQRCode from '../common/BookQRCode'
import styles from './SettingsSheet.module.css'

const SYNC_LABEL = {
  idle: '同期: 待機中',
  syncing: '同期: 送信中…',
  ok: '同期: 最新',
  error: '同期: エラー(ローカルには保存済み)',
}

const THEMES = [
  { id: '', label: '和紙(標準)', paper: '#e9edf2', accent: '#2f4a7a' },
  { id: 'sumi', label: '墨', paper: '#eeebe4', accent: '#37475c' },
  { id: 'indigo', label: '藍', paper: '#e3e8f0', accent: '#2843a0' },
  { id: 'sakura', label: '桜', paper: '#f5ecec', accent: '#c0506a' },
]

export default function SettingsSheet({ onClose }) {
  const { data, save, vault, dek, setVault, reload, lock, syncStatus, remoteConfigured } = useApp()
  const bookId = getBookId()

  const [newId, setNewId] = useState('')
  const [newPw, setNewPw] = useState('')
  const [addUserError, setAddUserError] = useState('')
  const [addUserOk, setAddUserOk] = useState(false)
  const [reloadMsg, setReloadMsg] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleAddUser(e) {
    e.preventDefault()
    setAddUserError('')
    setAddUserOk(false)
    if (!newId.trim() || newPw.length < 8) {
      setAddUserError('IDと8文字以上のパスワードを入力してください。')
      return
    }
    try {
      const nextVault = await addUser({ vault, dek, id: newId.trim(), password: newPw })
      setVault(nextVault)
      setAddUserOk(true)
      setNewId('')
      setNewPw('')
    } catch (err) {
      setAddUserError(err.message || '追加に失敗しました。')
    }
  }

  async function handleReload() {
    await reload()
    setReloadMsg('最新の内容に更新しました。')
    setTimeout(() => setReloadMsg(''), 2000)
  }

  function handleExport() {
    const json = exportDataJSON(data)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kurashicho-${todayStr()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function updateTheme(themeId) {
    save((prev) => ({ ...prev, settings: { ...prev.settings, theme: themeId } }))
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grip} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>設定</span>
          <button className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>テーマ</div>
          <p className={styles.small}>自分の手帳のように、色合いを選べます。</p>
          <div className={styles.themeGrid}>
            {THEMES.map((t) => {
              const active = (data.settings.theme || '') === t.id
              return (
                <button
                  key={t.id || 'default'}
                  type="button"
                  className={`${styles.themeSwatch} ${active ? styles.themeSwatchActive : ''}`}
                  onClick={() => updateTheme(t.id)}
                >
                  <span className={styles.themeSwatchPreview} style={{ background: t.paper, boxShadow: `inset 0 0 0 3px ${t.accent}` }} />
                  <span className={styles.themeSwatchLabel}>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {remoteConfigured && bookId && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>他の端末と共有</div>
            <p className={styles.small}>
              もう一方の端末のカメラでQRコードを読み取ると、帳面IDが自動で入力されます。あとは自分のID・パスワードを入力するだけです。
            </p>
            <BookQRCode url={buildJoinUrl(bookId)} size={160} />
            <div className={styles.row}>
              <input readOnly value={bookId} onFocus={(e) => e.target.select()} />
              <button
                className={styles.btn}
                onClick={() => {
                  navigator.clipboard?.writeText(bookId)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {copied ? 'コピーしました' : 'コピー'}
              </button>
            </div>
            <p className={styles.small}>{SYNC_LABEL[syncStatus] || SYNC_LABEL.idle}</p>
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>家族を追加</div>
          <form className={styles.section} onSubmit={handleAddUser}>
            <div className={styles.row}>
              <input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="新しいID" />
            </div>
            <div className={styles.row}>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="パスワード(8文字以上)"
              />
              <button className={styles.btnPrimary} type="submit">
                登録する
              </button>
            </div>
            {addUserError && <p className={styles.small} style={{ color: 'var(--shu)' }}>{addUserError}</p>}
            {addUserOk && (
              <p className={styles.small}>
                登録しました。同じ帳面を新しいIDで開けます{remoteConfigured && bookId && '(他の端末なら帳面IDも必要です)'}。
              </p>
            )}
          </form>
        </div>

        <div className={styles.section}>
          <button className={styles.fullBtn} onClick={handleReload}>
            最新に更新{reloadMsg && ` — ${reloadMsg}`}
          </button>
          <button className={styles.fullBtn} onClick={handleExport}>
            データを書き出す(JSON)
          </button>
          <button className={styles.fullBtn} style={{ color: 'var(--shu)' }} onClick={lock}>
            帳面を閉じる(ログアウト)
          </button>
        </div>
      </div>
    </div>
  )
}
