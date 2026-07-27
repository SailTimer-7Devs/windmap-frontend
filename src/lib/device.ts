import { UAParser } from 'ua-parser-js'

const parcer = new UAParser()

export const deviceType = parcer.getDevice().type

export const device = await parcer.getDevice().withFeatureCheck()
export const os = parcer.getOS()

export const isAndroid = device.is('Android')

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

export const isMobile =
    device.is('iPhone') ||
    device.is('iPad') ||
    isIPadReportingAsMac ||
    isAndroid 