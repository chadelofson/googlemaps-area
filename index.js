// This example requires the Drawing library. Include the libraries=drawing
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing">

const { getAreaOfPolygon, convertArea } = window.geolib;

let map;
let marker;
let drawingManager;
const WHITE = "fff";
const polygons = [];

async function initMap() {
  const { Map, MapTypeId } = await google.maps.importLibrary("maps");
  const core = await google.maps.importLibrary("core");
  const draw = await google.maps.importLibrary("drawing");
  const places = await google.maps.importLibrary("places");

  // Google Specific objects
  map = createMap(Map, MapTypeId);
  marker = new google.maps.Marker({
    map,
  });
  drawingManager = createDrawingManager(map, draw, "fff");

  const drawControlEl = createDrawingControls(draw, drawingManager);
  const addressControlEl = createAddressSearch();

  const autocomplete = new places.Autocomplete(addressControlEl.children[0]);

  drawingManager.setMap(map);

  google.maps.event.addListener(
    drawingManager,
    "polygoncomplete",
    handlePolygonComplete
  );

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlEl);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(addressControlEl);
}

function createDrawingControls(draw, drawingManager) {
  const drawControlEl = document.createElement("div");
  const drawBtn = createDrawingButton();
  drawBtn.addEventListener("click", () => {
    drawingManager.setDrawingMode(draw.OverlayType.POLYGON);
  });
  drawControlEl.appendChild(drawBtn);
  return drawControlEl;
}

function createDrawingButton() {
  const drawContainer = document.createElement("div");
  const drawBtn = document.createElement("button");
  drawBtn.textContent = "Draw";
  drawContainer.appendChild(drawBtn);
  return drawContainer;
}

function createMap(Map, MapTypeId) {
  return new Map(document.getElementById("map"), {
    center: { lat: 41.4848295, lng: -87.844035 },
    zoom: 12,
    fullscreenControl: false,
    mapTypeControl: false,
    mapTypeId: MapTypeId.HYBRID,
    streetViewControl: false,
  });
}

function createDrawingManager(map, draw, color) {
  return new draw.DrawingManager({
    map,
    drawingMode: null,
    drawingControl: false,
    polygonOptions: {
      strokeColor: color,
      fillColor: color,
      fillOpacity: 0.05,
      strokeOpacity: 0.9,
      editable: true,
      draggable: true,
      suppressUndo: true,
      clickable: true,
    },
  });
}

function createAddressSearch() {
  const searchContainer = document.createElement("div");
  const addressInput = document.createElement("input");
  addressInput.name = "address";
  addressInput.id = "address";
  addressInput.placeholder = "Enter Address";
  // places.AutoComplete(addressInput);
  const searchBtn = document.createElement("button");
  searchBtn.textContent = "Search";
  searchBtn.addEventListener("click", () => {
    const address = addressInput.value;
    showAddressLocation(address);
  });
  searchContainer.appendChild(addressInput);
  searchContainer.appendChild(searchBtn);
  return searchContainer;
}

function calculateTotalArea() {
  let totalArea = 0;
  for (const polygon of polygons) {
    totalArea += getAreaOfPolygon(getPolygonArray(polygon));
  }
  return convertArea(totalArea, "ft2").toFixed(1);
}

function getPolygonArray(polygon) {
  return polygon
    .getPath()
    .getArray()
    .map((p) => [p.lat(), p.lng()]);
}

function handlePolygonComplete(polygon) {
  console.log("Polygon Completed");
  polygons.push(polygon);
  handlePolygonEvent();
  drawingManager.setDrawingMode(null);
  drawingManager.setOptions({
    polygonOptions: {
      draggable: true,
      editable: true,
    },
  });
  google.maps.event.addListener(
    polygon.getPath(),
    "set_at",
    handlePolygonEvent
  );
  google.maps.event.addListener(
    polygon.getPath(),
    "insert_at",
    handlePolygonEvent
  );
}

function handlePolygonEvent() {
  console.log("Handling Polygon Event");
  postParentMessage(calculateTotalArea());
}

async function findLocation(address) {
  const { Geocoder } = await google.maps.importLibrary("geocoding");
  const geocoder = new Geocoder();
  try {
    const { results } = await geocoder.geocode({ address });
    map.setCenter(results[0].geometry.location);
    map.setZoom(20);
    marker.setPosition(results[0].geometry.location);
    marker.setMap(map);
    // responseDiv.style.display = "block";
    // response.innerText = JSON.stringify(result, null, 2);
    return results;
  } catch (error) {
    alert(`The address search was not successful: ${error}`);
  }
}

function showAddressLocation(address) {
  findLocation(address, (res, status) => {
    if (!res || status != google.maps.GeocoderStatus.OK) {
      // add an error message
    } else {
      const firstLocation = res[0];
      const point = firstLocation.geometry.location;
      markAddress(point);
    }
  });
}

function markAddress(point) {
  new google.maps.Marker({
    position: point,
    map,
    title: "Address Results",
  });
  map.setCenter(point);
  map.setZoom(12);
}

function postParentMessage(msg) {
  console.log("Posting Parent Message: ", msg);
  window.parent.postMessage(msg);
}

// window.initMap = initMap;
initMap();
