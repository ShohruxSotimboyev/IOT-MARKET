import { useEffect } from 'react'

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY
    const body = document.body
    const html = document.documentElement

    const prevBody = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    }
    const prevHtmlOverflow = html.style.overflow

    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    html.style.overflow = 'hidden'

    return () => {
      body.style.overflow = prevBody.overflow
      body.style.position = prevBody.position
      body.style.top = prevBody.top
      body.style.width = prevBody.width
      body.style.paddingRight = prevBody.paddingRight
      html.style.overflow = prevHtmlOverflow
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
