import { useState } from 'react'
import PlannedExpensesSettings from './PlannedExpensesSettings'
import AllowanceSettings from './AllowanceSettings'
import CategoryBudgetsSettings from './CategoryBudgetsSettings'
import styles from '../layout/SettingsSheet.module.css'

const MENU_ITEMS = [
  { key: 'planned', label: '先取り支出(固定費)', desc: '家賃・光熱費など毎月あらかじめ分かっている支出を収入から差し引く' },
  { key: 'allowance', label: '使えるお金(お小遣い)', desc: '自分の支出だけを差し引く、月々・締日制の個人予算' },
  { key: 'category', label: 'カテゴリ予算', desc: '食費・交際費など分類ごとの月の予算' },
]

export default function KakeiMenu({ onClose }) {
  const [section, setSection] = useState(null)

  if (section === 'planned') return <PlannedExpensesSettings onBack={() => setSection(null)} onClose={onClose} />
  if (section === 'allowance') return <AllowanceSettings onBack={() => setSection(null)} onClose={onClose} />
  if (section === 'category') return <CategoryBudgetsSettings onBack={() => setSection(null)} onClose={onClose} />

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grip} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>家計の設定</span>
          <button className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className={styles.section}>
          {MENU_ITEMS.map((item) => (
            <button key={item.key} className={styles.menuItem} onClick={() => setSection(item.key)}>
              <span className={styles.menuItemLabel}>{item.label}</span>
              <span className={styles.menuItemDesc}>{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
