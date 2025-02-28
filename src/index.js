import mapboxgl from 'mapbox-gl'
import { Deck } from '@deck.gl/core'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { BitmapLayer } from '@deck.gl/layers'
import { initConfig } from './config.js'
import ParticleLayer from './particle-layer.js'

const image = 'wind_data.png'
const heatmap = 'wind_data_heatmap.png'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2VyaGl5YW5kcmVqZXYiLCJhIjoiY2tkbHg4eWN2MTNlZzJ1bGhvcmMyc25tcCJ9.BGYH_9ryrV4r5ttG6VuxFQ'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

async function loadImage (url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

function calculateBounds (imageWidth, imageHeight) {
  const aspectRatio = imageWidth / imageHeight;
  const latRange = 180; // from -90 to 90
  const lonRange = latRange * aspectRatio;
  const halfLonRange = lonRange / 2;
  return [-halfLonRange, -90, halfLonRange, 90];
}

async function loadWindData (imageUrl, imageUnscale, bounds) {
  const img = new Image()
  img.src = imageUrl
  await new Promise(resolve => img.onload = resolve)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  
  
  const points = []
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4
      const u = (imageData.data[i] - 128) * (imageUnscale[1] - imageUnscale[0]) / 255 + imageUnscale[0]
      const v = (imageData.data[i + 1] - 128) * (imageUnscale[1] - imageUnscale[0]) / 255 + imageUnscale[0]
      const speed = Math.sqrt(u * u + v * v)
      const direction = Math.atan2(v, u) * 180 / Math.PI

      const lon = bounds[0] + (x / canvas.width) * (bounds[2] - bounds[0])
      const lat = bounds[1] + (y / canvas.height) * (bounds[3] - bounds[1])
      
      points.push({
        position: [lon, lat],
        speed: speed,
        direction: direction
      })
    }
  }
  return points
}


// Function to convert coordinates to image pixels
function coordsToPixels(lon, lat, bounds, imageWidth, imageHeight) {
  // For WGS84, we use direct linear interpolation
  const x = Math.floor((lon - bounds[0]) / (bounds[2] - bounds[0]) * imageWidth);
  const y = Math.floor((lat - bounds[1]) / (bounds[3] - bounds[1]) * imageHeight);
  return { x, y };
}


window.addEventListener('DOMContentLoaded', async () => {
  const config = initConfig()

  const imageUnscale = [-128, 127]
  const bounds = [-180, -90, 180, 90]

  const windImg = new Image();

  let windImageData = null;

  windImg.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = windImg.width;
    canvas.height = windImg.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(windImg, 0, 0);
    windImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  windImg.src = image;

  let heatmapImage;
  try {
    heatmapImage = await loadImage(heatmap);
    console.log('Heatmap loaded succesfuly:', heatmapImage.width, 'x', heatmapImage.height);
  } catch (error) {
    console.error('Heatmap load error:', error);
  }

  // Create the Mapbox instance separately
  const map = new mapboxgl.Map({
    container: 'deck',
    style: 'mapbox://styles/serhiyandrejev/cm7npjmqq003h01qu6xsj7qr0',
    center: [0.45, 51.47],
    zoom: 0,
    minZoom: 0,
    maxZoom: 15,
    projection: 'mercator'
  })

  const deckgl = new Deck()

  const heatmapLayer = new BitmapLayer({
    id: 'heatmap',
    bounds: [-180, -85.051129, 180, 85.051129],
    image: heatmapImage || heatmap,
    pickable: true,
    opacity: 0.1,
    desaturate: 0,
    transparentColor: [0, 0, 0, 0],
    tintColor: [255, 255, 255],
    _imageCoordinateSystem: 'COORDINATE_SYSTEM.LNGLAT',
    beforeId: 'waterway-label'
  })

  // Add particle layer
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
    getPolygonOffset: ({ layerIndex }) => [0, -1000]
  })

  function getWindData(x, y) {
    // Extract pixel data
    const index = (y * windImageData.width + x) * 4;
    const u = windImageData.data[index];      // Red channel value
    const v = windImageData.data[index + 1];    // Green channel value (or other, depending on encoding)
  
    // If the original wind value was encoded as: encoded = original + 128,
    // then for restoration we use:
    const unscaledU = u / 255 * (imageUnscale[1] - imageUnscale[0]) + imageUnscale[0];
    const unscaledV = v / 255 * (imageUnscale[1] - imageUnscale[0]) + imageUnscale[0];
  
    // Calculate wind speed
    const speed = Math.sqrt(unscaledU * unscaledU + unscaledV * unscaledV);
  
    // Calculate wind direction
    const windDirection = Math.atan2(unscaledV, unscaledU) * 180 / Math.PI;
    const direction = (270 + windDirection) % 360;
  
    return {
      speed: speed,
      direction: direction
    };
  }
  
  


  function getTooltip ({bitmap}) {
    if (!bitmap || !image) {
      return
    }

    const windData = getWindData(bitmap.pixel[0], bitmap.pixel[1])

    return `speed: ${windData.speed} \n direction: ${windData.direction}`
  }


  // Add the DeckGL overlay to Mapbox
  const overlay = new MapboxOverlay({
    // interleaved: true,
    initialViewState: {
      longitude: 0.45,
      latitude: 51.47,
      zoom: 0,
      minZoom: 0,
      maxZoom: 15,
    },
    controller: true,
    getTooltip,
    layers: [heatmapLayer, particleLayer]
  })

  map.addControl(overlay)
})
