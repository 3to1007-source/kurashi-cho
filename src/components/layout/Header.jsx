import styles from './Shell.module.css'

const TAB_LABELS = { kakei: '家計', karada: 'からだ', yotei: '予定', shisan: '試算' }

export default function Header({ tab, onOpenSettings, onOpenMenu }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {tab === 'kakei' && (
          <button className={styles.iconBtn} onClick={onOpenMenu} aria-label="家計の設定を開く">
            ☰
          </button>
        )}
        <span className={styles.brand}>暮らしの栞 ・ {TAB_LABELS[tab]}</span>
      </div>
      <button className={styles.iconBtn} onClick={onOpenSettings} aria-label="設定を開く">
        ⚙
      </button>
    </header>
  )
}
