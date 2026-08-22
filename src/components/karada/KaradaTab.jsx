import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { monthKey, yen } from '../../lib/format'
import { todayStr } from '../../lib/constants'
import KaradaChart from './KaradaChart'
import KaradaForm from './KaradaForm'
import common from '../../styles/common.module.css'

function avg(arr) {
  const vals = arr.filter((v) => v != null)
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export default function KaradaTab() {
  const { data, currentUser } = useApp()
  const thisMonth = monthKey(todayStr())

  const mine = useMemo(
    () => data.karada.filter((k) => k.who === currentUser && monthKey(k.date) === thisMonth),
    [data.karada, currentUser, thisMonth]
  )
  const sorted = useMemo(() => [...mine].sort((a, b) => (a.date < b.date ? -1 : 1)), [mine])

  const weightAvg = avg(mine.map((k) => k.weight))
  const sleepAvg = avg(mine.map((k) => k.sleep))
  const stepsAvg = avg(mine.map((k) => k.steps))

  const weightPoints = sorted.filter((k) => k.weight != null).map((k) => ({ date: k.date, weight: k.weight }))

  return (
    <div>
      <section className={common.section}>
        <div className={common.sectionTitle}>今月の平均({currentUser})</div>
        <div className={`${common.card} ${common.summaryRow}`}>
          <div className={common.summaryItem}>
            <span className={common.summaryLabel}>体重</span>
            <span className={common.summaryValue}>{weightAvg != null ? `${weightAvg.toFixed(1)}kg` : '—'}</span>
          </div>
          <div className={common.summaryItem}>
            <span className={common.summaryLabel}>睡眠</span>
            <span className={common.summaryValue}>{sleepAvg != null ? `${sleepAvg.toFixed(1)}h` : '—'}</span>
          </div>
          <div className={common.summaryItem}>
            <span className={common.summaryLabel}>歩数</span>
            <span className={common.summaryValue}>{stepsAvg != null ? yen(Math.round(stepsAvg)) : '—'}</span>
          </div>
        </div>
      </section>

      <section className={common.section}>
        <div className={common.sectionTitle}>体重の推移</div>
        <div className={common.card}>
          <KaradaChart points={weightPoints} />
        </div>
      </section>

      <section className={common.section}>
        <div className={common.sectionTitle}>記録する</div>
        <KaradaForm />
      </section>
    </div>
  )
}
