import styles from './Shell.module.css'

const TABS = [
  { key: 'kakei', label: '家計' },
  { key: 'karada', label: 'からだ' },
  { key: 'yotei', label: '予定' },
  { key: 'shisan', label: '試算' },
]

export default function TabBar({ tab, onChange }) {
  return (
    <nav className={styles.tabbar}>
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
          onClick={() => onChange(t.key)}
          aria-current={tab === t.key ? 'page' : undefined}
        >
          <span className={styles.tabDot} />
          {t.label}
        </button>
      ))}
    </nav>
  )
}
