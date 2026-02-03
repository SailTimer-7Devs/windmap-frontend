import { setParticlesNumbersByDeviceType } from 'lib/layer'

export const getDensity = (zoom: number): number => {
  if (zoom < 5) return -0.6
  if (zoom < 9) return -1.3
  return -2
}

export const getNumParticles = (zoom: number): number => {
  if (zoom < 5) return Math.floor(setParticlesNumbersByDeviceType() * 0.5)
  if (zoom < 9) return Math.floor(setParticlesNumbersByDeviceType() * 0.25)
  return Math.floor(setParticlesNumbersByDeviceType() * 0.1)
}
