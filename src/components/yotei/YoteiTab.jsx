import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { todayStr } from '../../lib/constants'
import MonthCalendar from './MonthCalendar'
import DayCard from './DayCard'
import common from '../../styles/common.module.css'

export default function YoteiTab() {
  const { data } = useApp()
  const today = todayStr()
  const [year, setYear] = useState(Number(today.slice(0, 4)))
  const [month, setMonth] = useState(Number(today.slice(5, 7)))
  const [selectedDate, setSelectedDate] = useState(today)

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
            selectedDate={selectedDate}
            todayDate={today}
            onSelect={setSelectedDate}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      </section>

      <section className={common.section}>
        <div className={common.card}>
          <DayCard date={selectedDate} />
        </div>
      </section>
    </div>
  )
}
