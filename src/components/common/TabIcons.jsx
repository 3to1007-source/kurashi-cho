function Svg({ children, active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export function KakeiIcon({ active }) {
  return (
    <Svg active={active}>
      <rect x="2.5" y="6" width="17" height="12" rx="2" />
      <path d="M2.5 9.7h17" />
      <circle cx="15.3" cy="13.6" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function KaradaIcon({ active }) {
  return (
    <Svg active={active}>
      <path d="M2.5 12h4l1.8-5 3 9.5 2-7 1.3 2.5h4.9" />
    </Svg>
  )
}

export function YoteiIcon({ active }) {
  return (
    <Svg active={active}>
      <rect x="2.5" y="4.2" width="17" height="15.3" rx="2" />
      <path d="M2.5 8.7h17" />
      <path d="M6.8 2.5v3.4M15.2 2.5v3.4" />
      <circle cx="7" cy="12.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="12.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12.8" r="1" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function ShisanIcon({ active }) {
  return (
    <Svg active={active}>
      <rect x="4.2" y="2.5" width="13.6" height="17" rx="2" />
      <rect x="6.5" y="5" width="9" height="3.4" rx="0.6" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="12.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="12.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="16.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="16.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="16.2" r="1" fill="currentColor" stroke="none" />
    </Svg>
  )
}
