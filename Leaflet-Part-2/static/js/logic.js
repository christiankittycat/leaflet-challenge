// Initialize the map
var map = L.map('map').setView([20, 0], 2);

// Define base maps
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors'
});

var satelliteMap = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Add the street map as the default
streetMap.addTo(map);

// Define the URL to fetch the earthquake data from the USGS website
var earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 4;
}

// Function to determine marker color based on earthquake depth
function markerColor(depth) {
  return depth > 90 ? '#ea2c2c' :
         depth > 70 ? '#ea822c' :
         depth > 50 ? '#ee9c00' :
         depth > 30 ? '#eecc00' :
         depth > 10 ? '#d4ee00' :
                      '#98ee00';
}

// Fetch the earthquake data
var earthquakes = new L.LayerGroup();

d3.json(earthquakeDataUrl).then(function(data) {
  // Create a GeoJSON layer with the retrieved data
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    // Function to run for each feature in the data
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }
  }).addTo(earthquakes);
});

// Fetch the tectonic plates data
var tectonicPlates = new L.LayerGroup();

d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(function(data) {
  L.geoJSON(data, {
    style: function() {
      return { color: "orange", weight: 2 };
    }
  }).addTo(tectonicPlates);
});

// Add a legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = [-10, 10, 30, 50, 70, 90],
      labels = [];

  // Loop through our depth intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(map);

// Define base maps object
var baseMaps = {
  "Street Map": streetMap,
  "Topographic Map": topoMap,
  "Satellite Map": satelliteMap
};

// Define overlay maps object
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);