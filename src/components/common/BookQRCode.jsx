import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function BookQRCode({ url, size = 200 }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { width: size, margin: 1 })
      .then((d) => {
        if (!cancelled) setDataUrl(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [url, size])

  if (!dataUrl) return null

  return <img src={dataUrl} alt="この帳面を開くQRコード" width={size} height={size} style={{ display: 'block', margin: '0 auto' }} />
}
