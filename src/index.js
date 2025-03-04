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

const heatmapNames = {
  'jet': 'wind_data_heatmap_jet.png',
  'edge': 'wind_data_heatmap_edge.png',
  'rainbow': 'wind_data_heatmap_rainbow.png',
  'turbo': 'wind_data_heatmap_turbo.png',
  'viridis': 'wind_data_heatmap_viridis.png',
}

let colorScales = {};

// Load color scales from JSON
async function loadColorScales() {
  try {
    const response = await fetch('colorscales.json');
    colorScales = await response.json();
  } catch (error) {
    console.error('Error loading color scales:', error);
  }
}

function generateGradient(colors) {
  return `linear-gradient(to right, ${colors.join(', ')})`;
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
    background: ${generateGradient(colorScales['jet'] || [])};
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
  return { container: colorBarContainer, gradientBar };
}

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

function createColorMapSelector() {
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    z-index: 9999;
  `;

  // Colormap selector
  const select = document.createElement('select');
  select.style.cssText = `
    padding: 5px;
    border-radius: 3px;
    border: 1px solid #ccc;
    background: white;
    font-family: Arial, sans-serif;
    width: 100%;
    margin-bottom: 10px;
  `;

  Object.keys(heatmapNames).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    select.appendChild(option);
  });

  // Opacity slider
  const sliderContainer = document.createElement('div');
  sliderContainer.style.marginBottom = '5px';
  
  const sliderLabel = document.createElement('label');
  sliderLabel.textContent = 'Opacity: ';
  sliderLabel.style.cssText = `
    display: block;
    color: #000;
  `;
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '10';
  slider.style.cssText = `
    width: 100%;
    opacity: 1;
  `;
  
  sliderContainer.appendChild(sliderLabel);
  sliderContainer.appendChild(slider);

  container.appendChild(select);
  container.appendChild(sliderContainer);

  return { container, select, slider };
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
  await loadColorScales(); // Load color scales first
  
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
  let currentHeatmap = 'jet'; // default colormap
  
  async function updateHeatmap(colormap) {
    try {
      const heatmapPath = heatmapNames[colormap];
      heatmapImage = await loadImage(heatmapPath);
      console.log('Heatmap loaded successfully:', heatmapImage.width, 'x', heatmapImage.height);
      
      // Update the heatmap layer
      if (overlay) {
        const newHeatmapLayer = new BitmapLayer({
          id: 'heatmap',
          bounds: [-180, -85.051129, 180, 85.051129],
          image: heatmapImage,
          pickable: true,
          opacity: 0.1,
          desaturate: 0,
          transparentColor: [0, 0, 0, 0],
          tintColor: [255, 255, 255],
          _imageCoordinateSystem: 'COORDINATE_SYSTEM.LNGLAT',
          beforeId: 'waterway-label'
        });
        
        overlay.setProps({
          layers: [newHeatmapLayer, particleLayer]
        });
      }
    } catch (error) {
      console.error('Heatmap load error:', error);
    }
  }

  // Initial heatmap load
  await updateHeatmap(currentHeatmap);

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
    
    let directionFrom = windData.direction;
    if (directionFrom >= 360) {
      directionFrom -= 360;
    }

    directionFrom = (180 - directionFrom + 360) % 360;

    const roundedDirectionFrom = Math.round(directionFrom * 100) / 100;

    let directionTo = (directionFrom + 180) % 360;

    const roundedDirectionTo = Math.round(directionTo * 100) / 100;

    //round coordinate to 3 decimal places
    const roundedCoordinate = coordinate.map(coord => Math.round(coord * 10000) / 10000)

    return `Speed: ${roundedSpeed} knots \n Direction From: ${roundedDirectionFrom}° \n Direction To: ${roundedDirectionTo}° \n Coordinates: ${roundedCoordinate[0]}, ${roundedCoordinate[1]}`
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
    const { container: colorBar, gradientBar } = createColorBar();
    document.body.appendChild(colorBar);

    // Add the colormap selector
    const { container: selectorContainer, select: colormapSelect, slider } = createColorMapSelector();
    document.body.appendChild(selectorContainer);

    // Add change event listener
    colormapSelect.addEventListener('change', (e) => {
      currentHeatmap = e.target.value;
      updateHeatmap(currentHeatmap);
      // Update color bar gradient
      if (colorScales[currentHeatmap]) {
        gradientBar.style.background = generateGradient(colorScales[currentHeatmap]);
      }
    });

    // Add slider event listener
    slider.addEventListener('input', (e) => {
      const opacity = parseFloat(e.target.value) / 100;
      const newHeatmapLayer = new BitmapLayer({
        id: 'heatmap',
        bounds: [-180, -85.051129, 180, 85.051129],
        image: heatmapImage,
        pickable: true,
        opacity: opacity,
        desaturate: 0,
        transparentColor: [0, 0, 0, 0],
        tintColor: [255, 255, 255],
        _imageCoordinateSystem: 'COORDINATE_SYSTEM.LNGLAT',
        beforeId: 'waterway-label'
      });
      
      overlay.setProps({
        layers: [newHeatmapLayer, particleLayer]
      });
    });
  });
})
