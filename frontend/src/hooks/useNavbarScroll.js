import { useEffect, useRef, useState } from 'react'

const HIDE_DELTA = 80   // was 10 — juda past edi, endi 80px pastga tushganda yashirinadi
const SHOW_DELTA = 20   // was 6
const TOP_ALWAYS_VISIBLE = 200  // was 100

/** Smoothed navbar hide on scroll down, reveal on scroll up */
export function useNavbarScroll() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrollDir, setScrollDir] = useState('up')
  const lastY = useRef(0)
  const accDown = useRef(0)
  const accUp = useRef(0)
  const hiddenRef = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      setScrolled(y > 24)

      if (y < TOP_ALWAYS_VISIBLE) {
        accDown.current = 0
        accUp.current = 0
        if (hiddenRef.current) {
          hiddenRef.current = false
          setHidden(false)
        }
        setScrollDir('up')
        lastY.current = y
        return
      }

      if (delta > 0) {
        accUp.current = 0
        accDown.current += delta
        if (accDown.current >= HIDE_DELTA && !hiddenRef.current) {
          hiddenRef.current = true
          setHidden(true)
          setScrollDir('down')
        }
      } else if (delta < 0) {
        accDown.current = 0
        accUp.current += Math.abs(delta)
        if (accUp.current >= SHOW_DELTA && hiddenRef.current) {
          hiddenRef.current = false
          setHidden(false)
          setScrollDir('up')
        }
      }

      lastY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { scrolled, hidden, scrollDir }
}
