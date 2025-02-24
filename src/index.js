import mapboxgl from 'mapbox-gl'
import { Deck } from '@deck.gl/core'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { FpsMeterControl } from './fps-meter.js'
import { initConfig, initGui } from './config.js'
import ParticleLayer from './particle-layer.js'

const image = 'wind_data.png'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2VyaGl5YW5kcmVqZXYiLCJhIjoiY2tkbHg4eWN2MTNlZzJ1bGhvcmMyc25tcCJ9.BGYH_9ryrV4r5ttG6VuxFQ'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

window.addEventListener('DOMContentLoaded', () => {
  const config = initConfig()

  const imageUnscale = [-128, 127]
  const bounds = [-180, -90, 180, 90]

  // Create the Mapbox instance separately
  const map = new mapboxgl.Map({
    container: 'deck', // Attach to #deck div
    style: 'mapbox://styles/serhiyandrejev/cm7dko5dk00c101s79467achq',
    center: [0.45, 51.47],
    zoom: 5,
    minZoom: 5,
    maxZoom: 15,
    projection: 'mercator' // Makes map flat instead of globe default view
  })

  // Create the DeckGL instance with Mapbox support
  const deckgl = new Deck()

  // Add the DeckGL overlay to Mapbox
  const overlay = new MapboxOverlay({
    layers: [],
    initialViewState: {
      longitude: 0.45,
      latitude: 51.47,
      zoom: 5,
      minZoom: 5,
      maxZoom: 15,
    },
    controller: true
  })

  map.addControl(overlay)

  // Function to update layers
  function update () {
    const particleLayer = new ParticleLayer({
      id: 'particle',
      image,
      imageUnscale,
      bounds,
      numParticles: config.particle.numParticles,
      maxAge: config.particle.maxAge,
      speedFactor: config.particle.speedFactor,
      color: config.particle.color,
      width: config.particle.width,
      opacity: config.particle.opacity,
      animate: config.particle.animate,
      getPolygonOffset: ({ layerIndex }) => [0, -1000],
    })

    overlay.setProps({ layers: [particleLayer] })
  }

  document.getElementById('top-left')
    .prepend(new FpsMeterControl().onAdd())

  update()
  initGui(config, update, { deckgl })
})
