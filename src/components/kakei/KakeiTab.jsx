import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { monthKey, yen } from '../../lib/format'
import { todayStr } from '../../lib/constants'
import { calcAllowance, calcHouseholdBudget } from '../../lib/allowance'
import CategoryBudgets from './CategoryBudgets'
import KakeiChart from './KakeiChart'
import KakeiForm from './KakeiForm'
import KakeiList from './KakeiList'
import common from '../../styles/common.module.css'

export default function KakeiTab() {
  const { data, currentUser } = useApp()
  const today = todayStr()
  const thisMonth = monthKey(today)

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

  const hasCategoryBudgets = Object.values(data.settings.categoryBudgets || {}).some((v) => v > 0)

  const allowanceInfo = useMemo(
    () =>
      calcAllowance({
        kakei: data.kakei,
        userId: currentUser,
        allowance: data.settings.allowances?.[currentUser],
        todayStr: today,
      }),
    [data.kakei, data.settings.allowances, currentUser, today]
  )

  const householdInfo = useMemo(
    () =>
      calcHouseholdBudget({
        plannedIncome: data.settings.plannedIncome,
        plannedExpenses: data.settings.plannedExpenses,
        cycle: data.settings.householdCycle,
        todayStr: today,
      }),
    [data.settings.plannedIncome, data.settings.plannedExpenses, data.settings.householdCycle, today]
  )

  return (
    <div>
      <section className={common.section}>
        <div className={common.sectionTitle}>今月家計で使えるお金</div>
        <div className={common.card}>
          {householdInfo ? (
            <>
              <div className={common.summaryItem}>
                <span className={common.summaryLabel}>残金</span>
                <span
                  className={common.summaryValue}
                  style={{ fontSize: 30, color: householdInfo.remaining < 0 ? 'var(--shu)' : 'var(--ink)' }}
                >
                  {yen(householdInfo.remaining)}円
                </span>
              </div>
              <p className={common.note} style={{ marginTop: 8 }}>
                {householdInfo.start} 〜 {householdInfo.end} ・ 予定収入{yen(householdInfo.income)}円 − 先取り支出{yen(householdInfo.plannedTotal)}円
              </p>
            </>
          ) : (
            <p className={common.empty}>
              左上のメニュー(☰)の「予定収入・先取り支出」から、給料などの予定収入と、あらかじめ分かっている支出を登録すると、ここに今月使えるお金が表示されます。
            </p>
          )}
        </div>
      </section>

      <section className={common.section}>
        <div className={common.sectionTitle}>使えるお金({currentUser})</div>
        <div className={common.card}>
          {allowanceInfo ? (
            <>
              <div className={common.summaryItem}>
                <span className={common.summaryLabel}>今月あと</span>
                <span
                  className={common.summaryValue}
                  style={{ fontSize: 30, color: allowanceInfo.remaining < 0 ? 'var(--shu)' : 'var(--ink)' }}
                >
                  {yen(allowanceInfo.remaining)}円
                </span>
              </div>
              <p className={common.note} style={{ marginTop: 8 }}>
                {allowanceInfo.start} 〜 {allowanceInfo.end} ・ 予算{yen(allowanceInfo.monthly)}円のうち{yen(allowanceInfo.spent)}円使用
              </p>
            </>
          ) : (
            <p className={common.empty}>
              左上のメニュー(☰)の「使えるお金(お小遣い)」から月の予算・開始日・締日を登録すると、ここに残額が表示されます。
            </p>
          )}
        </div>
      </section>

      {hasCategoryBudgets && (
        <section className={common.section}>
          <div className={common.sectionTitle}>カテゴリ予算</div>
          <div className={common.card}>
            <CategoryBudgets kakei={data.kakei} categoryBudgets={data.settings.categoryBudgets} todayStr={today} />
          </div>
        </section>
      )}

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
