import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { todayStr } from '../../lib/constants'
import common from '../../styles/common.module.css'

export default function KaradaForm() {
  const { save, currentUser, data } = useApp()
  const existing = data.karada.find((k) => k.date === todayStr() && k.who === currentUser)

  const [date, setDate] = useState(todayStr())
  const [weight, setWeight] = useState(existing?.weight ?? '')
  const [sleep, setSleep] = useState(existing?.sleep ?? '')
  const [steps, setSteps] = useState(existing?.steps ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    const entry = {
      date,
      who: currentUser,
      weight: weight === '' ? null : Number(weight),
      sleep: sleep === '' ? null : Number(sleep),
      steps: steps === '' ? null : Number(steps),
    }
    if (entry.weight == null && entry.sleep == null && entry.steps == null) return

    save((prev) => {
      const idx = prev.karada.findIndex((k) => k.date === date && k.who === currentUser)
      const next = [...prev.karada]
      if (idx >= 0) next[idx] = entry
      else next.push(entry)
      return { ...prev, karada: next }
    })
  }

  return (
    <form className={common.card} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className={common.formCol}>
        <label htmlFor="karada-date">日付</label>
        <input id="karada-date" className={common.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className={common.formRow}>
        <div className={common.formCol}>
          <label htmlFor="karada-weight">体重(kg)</label>
          <input
            id="karada-weight"
            className={common.input}
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className={common.formCol}>
          <label htmlFor="karada-sleep">睡眠(時間)</label>
          <input
            id="karada-sleep"
            className={common.input}
            type="number"
            inputMode="decimal"
            step="0.1"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
          />
        </div>
      </div>
      <div className={common.formCol}>
        <label htmlFor="karada-steps">歩数</label>
        <input
          id="karada-steps"
          className={common.input}
          type="number"
          inputMode="numeric"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />
      </div>
      <button className={common.submitBtn} type="submit">
        記録する
      </button>
    </form>
  )
}
