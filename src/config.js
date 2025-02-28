import mobile from 'is-mobile'

const isMobile = mobile()

export function initConfig () {
  return {
    rotate: false,
    particle: {
      numParticles: isMobile ? 2000 : 5000,
      maxAge: isMobile ? 25 : 40,
      speedFactor: isMobile ? 4 : 5,
      color: [255, 255, 255],
      width: 2,
      opacity: 0.3,
      animate: true
    }
  }
}
