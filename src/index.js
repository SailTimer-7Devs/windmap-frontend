import mapboxgl from 'mapbox-gl'
import { Deck } from '@deck.gl/core'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { BitmapLayer } from '@deck.gl/layers'
import { FpsMeterControl } from './fps-meter.js'
import { initConfig, initGui } from './config.js'
import ParticleLayer from './particle-layer.js'

const image = 'wind_data.png'
const heatmap = 'wind_data_heatmap.png'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2VyaGl5YW5kcmVqZXYiLCJhIjoiY2tkbHg4eWN2MTNlZzJ1bGhvcmMyc25tcCJ9.BGYH_9ryrV4r5ttG6VuxFQ'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

// Функция для загрузки изображения
async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';  // Важно для CORS
    img.src = url;
  });
}

// Функция для расчета правильных границ изображения
function calculateBounds(imageWidth, imageHeight) {
  const aspectRatio = imageWidth / imageHeight;
  const latRange = 180; // от -90 до 90
  const lonRange = latRange * aspectRatio;
  const halfLonRange = lonRange / 2;
  return [-halfLonRange, -90, halfLonRange, 90];
}

async function loadWindData(imageUrl, imageUnscale, bounds) {
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
      
      const lon = bounds[0] + (x / canvas.width) * (bounds[2] - bounds[0])
      const lat = bounds[1] + (y / canvas.height) * (bounds[3] - bounds[1])
      
      points.push({
        position: [lon, lat],
        speed: speed
      })
    }
  }
  return points
}

// Function to get wind data at point
function getWindData(x, y, imageData, imageWidth, imageUnscale, bounds) {
  const i = (y * imageWidth + x) * 4;
  
  // Get U and V components from red and blue channels
  const u = imageData.data[i];      // 0..255
  const v = imageData.data[i + 2];  // 0..255
  
  // Convert to actual wind speed values (-128..127 m/s)
  const realU = u - 128;
  const realV = v - 128;
  
  // Calculate speed (in m/s)
  const speed = Math.sqrt(realU * realU + realV * realV);
  
  // Calculate wind direction
  // atan2 gives angle counter-clockwise from positive x-axis
  const windDirection = Math.atan2(realV, realU) * 180 / Math.PI;
  
  // Convert to meteorological convention (direction wind is coming FROM)
  // 0° is North, 90° is East, 180° is South, 270° is West
  const direction = (270 + windDirection) % 360;
  
  return { 
    speed: speed, 
    direction: direction
  };
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
  const bounds = [-180, -90, 180, 90] // Фиксированные границы для всех слоев

  // Загружаем данные о ветре
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

  // Предварительно загружаем изображение тепловой карты
  let heatmapImage;
  try {
    heatmapImage = await loadImage(heatmap);
    console.log('Тепловая карта загружена успешно:', heatmapImage.width, 'x', heatmapImage.height);
  } catch (error) {
    console.error('Ошибка загрузки тепловой карты:', error);
  }

  // Create the Mapbox instance separately
  const map = new mapboxgl.Map({
    container: 'deck',
    style: 'mapbox://styles/serhiyandrejev/cm7dko5dk00c101s79467achq',
    center: [0.45, 51.47],
    zoom: 0,
    minZoom: 0,
    maxZoom: 15,
    projection: 'mercator'
  })

  // Create the DeckGL instance with Mapbox support
  const deckgl = new Deck()

  // Add the DeckGL overlay to Mapbox
  const overlay = new MapboxOverlay({
    layers: [],
    initialViewState: {
      longitude: 0.45,
      latitude: 51.47,
      zoom: 0,
      minZoom: 0,
      maxZoom: 15,
    },
    controller: true
  })

  map.addControl(overlay)

  // Function to update layers
  function update() {
    const layers = []

    // Add raster layer for heatmap
    const heatmapLayer = new BitmapLayer({
      id: 'heatmap',
      bounds: [-180, -85.051129, 180, 85.051129],
      image: heatmapImage || heatmap,
      opacity: 0.3,
      desaturate: 0,
      transparentColor: [0, 0, 0, 0],
      tintColor: [255, 255, 255],
      _imageCoordinateSystem: 'COORDINATE_SYSTEM.LNGLAT'
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
      getPolygonOffset: ({ layerIndex }) => [0, -1000],
    })

    layers.push(heatmapLayer, particleLayer)
    overlay.setProps({ layers })
  }

  document.getElementById('top-left')
    .prepend(new FpsMeterControl().onAdd())

  update()
  initGui(config, update, { deckgl })
})
