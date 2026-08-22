import styles from './Yotei.module.css'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function MonthCalendar({ year, month, marks, selectedDate, todayDate, onSelect, onPrev, onNext }) {
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className={styles.calHeader}>
        <button className={styles.calNav} onClick={onPrev} aria-label="前の月">
          ‹
        </button>
        <span className={styles.calMonth}>
          {year}年{month}月
        </span>
        <button className={styles.calNav} onClick={onNext} aria-label="次の月">
          ›
        </button>
      </div>
      <div className={styles.grid}>
        {WEEKDAYS.map((w) => (
          <div className={styles.weekday} key={w}>
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} className={`${styles.day} ${styles.dayEmpty}`} />
          const dateStr = `${year}-${pad(month)}-${pad(d)}`
          const m = marks[dateStr] || {}
          const isToday = dateStr === todayDate
          const isSelected = dateStr === selectedDate
          return (
            <button
              key={dateStr}
              className={`${styles.day} ${isToday ? styles.dayToday : ''} ${isSelected ? styles.daySelected : ''}`}
              onClick={() => onSelect(dateStr)}
            >
              <span>{d}</span>
              <span className={styles.dots}>
                {m.kakei && <span className={`${styles.dot} ${styles.dotKakei}`} />}
                {m.karada && <span className={`${styles.dot} ${styles.dotKarada}`} />}
                {m.yotei && <span className={`${styles.dot} ${styles.dotYotei}`} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
