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


function createColorBar() {
  const colorBarContainer = document.createElement('div');
  colorBarContainer.className = 'color-bar-container';
  colorBarContainer.style.cssText = `
    position: absolute;
    bottom: 30px;
    right: 10px;
    width: 300px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    padding: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    font-family: Arial, sans-serif;
    pointer-events: none;
  `;

  // Title
  const title = document.createElement('div');
  title.textContent = 'Wind Speed (knots)';
  title.style.cssText = 'font-weight: bold; margin-bottom: 5px; text-align: center;';
  colorBarContainer.appendChild(title);

  // Create the gradient bar
  const gradientBar = document.createElement('div');
  gradientBar.style.cssText = `
    height: 20px;
    width: 100%;
    margin: 5px 0;
    background: linear-gradient(to right, 
      rgb(68, 1, 84), rgb(69, 9, 92), rgb(70, 18, 100), rgb(71, 26, 108), 
      rgb(72, 35, 116), rgb(70, 43, 120), rgb(68, 51, 125), rgb(66, 59, 130), 
      rgb(64, 67, 135), rgb(61, 73, 136), rgb(58, 80, 138), rgb(55, 87, 139), 
      rgb(52, 94, 141), rgb(49, 100, 141), rgb(46, 107, 142), rgb(43, 114, 142), 
      rgb(41, 121, 142), rgb(38, 126, 141), rgb(36, 132, 141), rgb(253, 231, 37), 
      rgb(253, 231, 37), rgb(253, 231, 37), rgb(253, 231, 37), rgb(253, 231, 37), 
      rgb(240, 100, 100), rgb(230, 80, 80), rgb(220, 60, 60), rgb(210, 40, 40), 
      rgb(200, 30, 30), rgb(190, 25, 25), rgb(180, 20, 20), rgb(170, 15, 15), 
      rgb(160, 12, 12), rgb(150, 10, 10), rgb(140, 8, 8), rgb(130, 5, 5)
    );
    border-radius: 2px;
  `;
  colorBarContainer.appendChild(gradientBar);

  // Create labels container
  const labelsContainer = document.createElement('div');
  labelsContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    margin-top: 2px;
    font-size: 12px;
  `;

  // Add key markers at specific points
  const keyPoints = [0, 5, 10, 15, 20, 25, 30, 35];
  keyPoints.forEach(value => {
    const label = document.createElement('div');
    label.textContent = value;
    labelsContainer.appendChild(label);
  });

  colorBarContainer.appendChild(labelsContainer);
  return colorBarContainer;
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

  function getTooltip ({bitmap, coordinate}) {
    if (!bitmap || !image) {
      return
    }

    const new_pixel = coordsToPixels(coordinate[0], coordinate[1], [-180, 90, 180, -90], windImageData.width, windImageData.height)

    const windData = getWindData(new_pixel.x, new_pixel.y)

    //round every value to 2 decimal places and conver speed to knots from m/s
    const roundedSpeed = Math.round(windData.speed * 1.94384 * 100) / 100
    const roundedDirection = Math.round(windData.direction * 100) / 100

    //round coordinate to 3 decimal places
    const roundedCoordinate = coordinate.map(coord => Math.round(coord * 10000) / 10000)

    return `Speed: ${roundedSpeed} knots \n Direction FROM: ${roundedDirection}° \n Coordinates: ${roundedCoordinate[0]}, ${roundedCoordinate[1]}`
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

  map.on('load', () => {
    // Add the color bar to the map container
    const colorBar = createColorBar();
    document.body.appendChild(colorBar);
  });
})
