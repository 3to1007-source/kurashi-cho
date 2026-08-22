const WIDTH = 320
const HEIGHT = 120
const PAD = 16

export default function KaradaChart({ points }) {
  if (points.length < 2) {
    return <p style={{ color: 'var(--ink-soft)', fontSize: 12 }}>体重の記録が2件以上になるとグラフが表示されます。</p>
  }

  const values = points.map((p) => p.weight)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const stepX = (WIDTH - PAD * 2) / (points.length - 1)
  const coords = points.map((p, i) => {
    const x = PAD + i * stepX
    const y = HEIGHT - PAD - ((p.weight - min) / range) * (HEIGHT - PAD * 2)
    return [x, y]
  })

  const pathD = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label="体重の推移">
      <path d={pathD} fill="none" stroke="var(--take)" strokeWidth="2" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="var(--take)" />
      ))}
    </svg>
  )
}
