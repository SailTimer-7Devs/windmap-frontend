import { UAParser } from 'ua-parser-js'

const parcer = new UAParser()

export const deviceType = parcer.getDevice().type

export const device = await parcer.getDevice().withFeatureCheck()
export const os = parcer.getOS()

/* ua-parser's feature-checked device result can be empty for Android tablet
   WebViews (most often in a wide landscape viewport). The platform token is
   stable in Android WebView user agents, so keep it as the authoritative
   fallback and do not let rotation switch the weather map to desktop UI. */
export const isAndroid =
    device.is('Android') ||
    (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent))

/* iPadOS Safari reports a desktop "Macintosh" User-Agent by default (Apple's
   intentional behavior since iOS 13), which ua-parser-js normally catches via
   a `navigator.standalone` check — but that's a WebKit-only API, so it never
   fires in Chromium browsers (incl. Chrome DevTools' own iPad device presets).
   No real Mac has a touchscreen, so a Mac-reporting UA with multi-touch is a
   safe standalone signal for "this is actually an iPad". */
const isIPadReportingAsMac =
    typeof navigator !== 'undefined' &&
    /Macintosh/.test(navigator.userAgent) &&
    navigator.maxTouchPoints > 2

/* Chrome DevTools may apply an iPad-sized viewport without reliably changing
   the page's user agent (especially when device mode is enabled after load).
   Treat the tablet breakpoint as the touch layout as well, so the map's
   tap-target, fixed info box, and hourly forecast remain testable and usable
   at iPad dimensions regardless of the reported browser identity. */
const usesTabletLayout =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 1024px)').matches

export const isMobile =
    device.is('iPhone') ||
    device.is('iPad') ||
    isIPadReportingAsMac ||
    isAndroid ||
    usesTabletLayout
