import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { monthKey, yen } from '../../lib/format'
import { todayStr } from '../../lib/constants'
import KakeiChart from './KakeiChart'
import KakeiForm from './KakeiForm'
import KakeiList from './KakeiList'
import common from '../../styles/common.module.css'

export default function KakeiTab() {
  const { data } = useApp()
  const thisMonth = monthKey(todayStr())

  const monthRecords = useMemo(
    () => data.kakei.filter((r) => monthKey(r.date) === thisMonth),
    [data.kakei, thisMonth]
  )

  const { income, expense } = useMemo(() => {
    let income = 0
    let expense = 0
    monthRecords.forEach((r) => {
      if (r.type === 'in') income += r.amount
      else expense += r.amount
    })
    return { income, expense }
  }, [monthRecords])

  const outRecords = monthRecords.filter((r) => r.type === 'out')

  return (
    <div>
      <section className={common.section}>
        <div className={common.sectionTitle}>今月のサマリー</div>
        <div className={`${common.card} ${common.summaryRow}`}>
          <div className={common.summaryItem}>
            <span className={common.summaryLabel}>収入</span>
            <span className={common.summaryValue} style={{ color: 'var(--take)' }}>
              {yen(income)}
            </span>
          </div>
          <div className={common.summaryItem}>
            <span className={common.summaryLabel}>支出</span>
            <span className={common.summaryValue} style={{ color: 'var(--shu)' }}>
              {yen(expense)}
            </span>
          </div>
          <div className={common.summaryItem}>
            <span className={common.summaryLabel}>差引</span>
            <span className={common.summaryValue}>{yen(income - expense)}</span>
          </div>
        </div>
      </section>

      {outRecords.length > 0 && (
        <section className={common.section}>
          <div className={common.sectionTitle}>支出の内訳</div>
          <div className={common.card}>
            <KakeiChart records={outRecords} />
          </div>
        </section>
      )}

      <section className={common.section}>
        <div className={common.sectionTitle}>記録する</div>
        <KakeiForm />
      </section>

      <section className={common.section}>
        <div className={common.sectionTitle}>今月の記録</div>
        <KakeiList records={monthRecords} />
      </section>
    </div>
  )
}
