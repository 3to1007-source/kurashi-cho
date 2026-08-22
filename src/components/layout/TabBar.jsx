import { KakeiIcon, KaradaIcon, YoteiIcon, ShisanIcon } from '../common/TabIcons'
import styles from './Shell.module.css'

const TABS = [
  { key: 'kakei', label: '家計', Icon: KakeiIcon },
  { key: 'karada', label: 'からだ', Icon: KaradaIcon },
  { key: 'yotei', label: '予定', Icon: YoteiIcon },
  { key: 'shisan', label: '試算', Icon: ShisanIcon },
]

export default function TabBar({ tab, onChange }) {
  return (
    <nav className={styles.tabbar}>
      {TABS.map((t) => {
        const active = tab === t.key
        return (
          <button
            key={t.key}
            className={`${styles.tab} ${active ? styles.tabActive : ''}`}
            onClick={() => onChange(t.key)}
            aria-current={active ? 'page' : undefined}
          >
            <t.Icon active={active} />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
