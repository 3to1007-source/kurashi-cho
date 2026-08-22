import styles from './Shell.module.css'

const TAB_LABELS = { kakei: '家計', karada: 'からだ', yotei: '予定', shisan: '試算' }

export default function Header({ tab, onOpenSettings }) {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>暮らし帳 ・ {TAB_LABELS[tab]}</span>
      <button className={styles.gear} onClick={onOpenSettings} aria-label="設定を開く">
        ⚙
      </button>
    </header>
  )
}
