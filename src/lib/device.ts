import { UAParser } from 'ua-parser-js'

const parcer = new UAParser()

export const deviceType = parcer.getDevice().type

export const device = await parcer.getDevice().withFeatureCheck()
export const os = parcer.getOS()

export const isAndroid = device.is('Android')

export const isMobile =
    device.is('iPhone') ||
    device.is('iPad') ||
    isAndroid 