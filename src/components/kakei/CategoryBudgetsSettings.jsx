import { useApp } from '../../context/AppContext'
import { KAKEI_OUT_CATEGORIES } from '../../lib/constants'
import styles from '../layout/SettingsSheet.module.css'

export default function CategoryBudgetsSettings({ onBack, onClose }) {
  const { data, save } = useApp()
  const categories = data.settings.kakeiOutCategories?.length ? data.settings.kakeiOutCategories : KAKEI_OUT_CATEGORIES

  function updateCategoryBudget(category, value) {
    const amount = Number(value) || 0
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        categoryBudgets: { ...prev.settings.categoryBudgets, [category]: amount },
      },
    }))
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grip} />
        <div className={styles.sheetHeader}>
          <button className={styles.backBtn} onClick={onBack}>
            ‹ 戻る
          </button>
          <span className={styles.sheetTitle}>カテゴリ予算</span>
          <button className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className={styles.section}>
          <p className={styles.small}>分類ごとの月の予算です。家計に記録された支出を、記録した人にかかわらず合算して差し引きます。</p>
          {categories.map((c) => (
            <div className={styles.row} key={c}>
              <span style={{ flex: '0 0 92px', fontSize: 15, alignSelf: 'center' }}>{c}</span>
              <input
                type="number"
                inputMode="numeric"
                value={data.settings.categoryBudgets?.[c] || ''}
                onChange={(e) => updateCategoryBudget(c, e.target.value)}
                placeholder="未設定"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
