import type { NavigateFunction } from 'react-router-dom'

/** Navigare către o rută internă păstrând integral query string-ul (evită pierderea parametrilor la `navigate(string)`). */
export function navigateToInternalPath(navigate: NavigateFunction, to: string) {
  if (to.startsWith('http://') || to.startsWith('https://')) {
    window.location.assign(to)
    return
  }
  const u = new URL(to, window.location.origin)
  navigate({ pathname: u.pathname, search: u.search, hash: u.hash }, { replace: true })
}
