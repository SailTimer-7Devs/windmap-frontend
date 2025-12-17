import { UAParser } from 'ua-parser-js'

const parcer = new UAParser()

export const deviceType = parcer.getDevice().type
export const deviceOsName = parcer.getOS().name

export const isAndroid = deviceOsName === 'Android'

const isIpad =
    deviceOsName === 'macOS' &&
    navigator.maxTouchPoints > 1

export const isMobile =
    deviceType === 'mobile' ||
    deviceType === 'tablet' ||
    isIpad
