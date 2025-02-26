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

export function initGuiSimple (config, update, { globe } = {}) {
  const gui = new dat.GUI()
  gui.width = 300

  if (globe) {
    gui.add(config, 'rotate').onChange(update)
  }

  return gui
}

export function initGui (config, update, { deckgl, globe } = {}) {
  const gui = initGuiSimple(config, update, { globe })

  const particle = gui.addFolder('ParticleLayer')
  particle.add(config.particle, 'numParticles', 0, 100000, 1).onFinishChange(update)
  particle.add(config.particle, 'maxAge', 1, 255, 1).onFinishChange(update)
  particle.add(config.particle, 'speedFactor', 0.1, 20, 0.1).onChange(update)
  particle.addColor(config.particle, 'color').onChange(update)
  particle.add(config.particle, 'width', 0.5, 5, 0.5).onChange(update)
  particle.add(config.particle, 'opacity', 0, 1, 0.01).onChange(update)
  particle.add(config.particle, 'animate').onChange(update)
  particle.add({ step: () => deckgl.props.layers.find(x => x.id === 'particle')?.step() }, 'step')
  particle.add({ clear: () => deckgl.props.layers.find(x => x.id === 'particle')?.clear() }, 'clear')
  particle.open()
}
