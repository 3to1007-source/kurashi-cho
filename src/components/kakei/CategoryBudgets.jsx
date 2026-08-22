import { calcCategoryBudget } from '../../lib/allowance'
import { yen } from '../../lib/format'
import styles from './Kakei.module.css'

export default function CategoryBudgets({ kakei, categoryBudgets, todayStr }) {
  const rows = Object.entries(categoryBudgets || {})
    .filter(([, monthly]) => monthly > 0)
    .map(([category, monthly]) => ({
      category,
      ...calcCategoryBudget({ kakei, category, monthly, todayStr }),
    }))

  if (rows.length === 0) return null

  return (
    <div>
      {rows.map((r) => (
        <div className={styles.barRow} key={r.category}>
          <span className={styles.barLabel}>{r.category}</span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{
                width: `${Math.min(100, (r.spent / r.monthly) * 100)}%`,
                background: r.remaining < 0 ? 'var(--shu)' : 'var(--yamabuki)',
              }}
            />
          </span>
          <span className={styles.barValue} style={{ color: r.remaining < 0 ? 'var(--shu)' : 'var(--ink)' }}>
            残{yen(r.remaining)}
          </span>
        </div>
      ))}
    </div>
  )
}
