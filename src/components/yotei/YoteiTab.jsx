import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { todayStr } from '../../lib/constants'
import MonthCalendar from './MonthCalendar'
import DayCard from './DayCard'
import common from '../../styles/common.module.css'
import styles from './Yotei.module.css'

export default function YoteiTab() {
  const { data } = useApp()
  const today = todayStr()
  const [year, setYear] = useState(Number(today.slice(0, 4)))
  const [month, setMonth] = useState(Number(today.slice(5, 7)))
  const [openDate, setOpenDate] = useState(null)

  const marks = useMemo(() => {
    const m = {}
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`
    data.kakei.forEach((r) => {
      if (r.date.startsWith(monthPrefix)) (m[r.date] ??= {}).kakei = true
    })
    data.karada.forEach((r) => {
      if (r.date.startsWith(monthPrefix)) (m[r.date] ??= {}).karada = true
    })
    data.yotei.forEach((r) => {
      if (r.date.startsWith(monthPrefix)) (m[r.date] ??= {}).yotei = true
    })
    return m
  }, [data, year, month])

  const todayMarks = marks[today] || {}

  function goPrev() {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((mo) => mo - 1)
    }
  }

  function goNext() {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((mo) => mo + 1)
    }
  }

  return (
    <div>
      <section className={common.section}>
        <div className={common.card}>
          <MonthCalendar
            year={year}
            month={month}
            marks={marks}
            selectedDate={openDate}
            todayDate={today}
            onSelect={setOpenDate}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      </section>

      <section className={common.section}>
        <button className={styles.teaser} onClick={() => setOpenDate(today)}>
          <span className={styles.teaserLabel}>今日の帳</span>
          <span className={styles.teaserDots}>
            {todayMarks.kakei && <span className={`${styles.teaserDot} ${styles.dotKakei}`} />}
            {todayMarks.karada && <span className={`${styles.teaserDot} ${styles.dotKarada}`} />}
            {todayMarks.yotei && <span className={`${styles.teaserDot} ${styles.dotYotei}`} />}
          </span>
          <span className={styles.teaserArrow}>見る ›</span>
        </button>
      </section>

      {openDate && (
        <div className={styles.dayBackdrop} onClick={() => setOpenDate(null)}>
          <div className={styles.daySheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dayGrip} />
            <div className={styles.dayHeader}>
              <button className={styles.dayClose} onClick={() => setOpenDate(null)}>
                閉じる
              </button>
            </div>
            <DayCard date={openDate} />
          </div>
        </div>
      )}
    </div>
  )
}
