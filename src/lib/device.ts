import { UAParser } from 'ua-parser-js'

const parcer = new UAParser()

export const deviceType = parcer.getDevice().type
export const deviceOsName = parcer.getOS().name

export const isAndroid = deviceOsName === 'Android'