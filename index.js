// This example requires the Drawing library. Include the libraries=drawing
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing">

const { getAreaOfPolygon, convertArea } = window.geolib;

let map;
let drawingManager;
let isSub = false;
const WHITE = "fff";
const RED = "ff0000";
const addPolygons = [];
const subPolygons = [];

async function initMap() {
  const { Map, MapTypeId } = await google.maps.importLibrary("maps");
  const core = await google.maps.importLibrary("core");
  const draw = await google.maps.importLibrary("drawing");

  map = createMap(Map, MapTypeId);
  drawingManager = createDrawingManager(map, draw, "fff");

  google.maps.event.addListener(
    drawingManager,
    "polygoncomplete",
    (polygon) => {
      isSub ? appendSubPolygon(polygon) : appendAddPolygon(polygon);
      console.log(calculateTotalArea());
      drawingManager.setDrawingMode(null);
      drawingManager.setOptions({
        polygonOptions: {
          draggable: true,
          editable: true,
        },
      });
    }
  );

  const drawControlEl = createDrawingControls(draw, drawingManager);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(drawControlEl);

  // console.log("Drawing Manager Instance: ", drawingMsdanager);
}

function createDrawingControls(draw, drawingManager) {
  const drawControlEl = document.createElement("div");
  const drawAddBtn = createAddDrawingButton(draw);
  drawAddBtn.addEventListener("click", () => {
    const color = "white";
    isSub = false;
    drawingManager.setDrawingMode(draw.OverlayType.POLYGON);
    drawingManager.setOptions({
      polygonOptions: {
        strokeColor: color,
      },
    });
  });
  const drawSubBtn = createSubDrawingButton(draw);
  drawSubBtn.addEventListener("click", (e) => {
    const color = "red";
    isSub = true;
    drawingManager.setDrawingMode(draw.OverlayType.POLYGON);
    drawingManager.setOptions({
      polygonOptions: {
        strokeColor: color,
      },
    });
  });
  drawControlEl.appendChild(drawAddBtn);
  drawControlEl.appendChild(drawSubBtn);
  return drawControlEl;
}

function createAddDrawingButton(draw, drawManager) {
  const drawBtn = document.createElement("button");
  drawBtn.textContent = "Include";
  drawBtn.addEventListener("click", (e) => {});

  return drawBtn;
}

function createSubDrawingButton(draw) {
  isSub = true;
  const color = "ff0000";
  const drawBtn = document.createElement("button");
  drawBtn.textContent = "Exclude";

  return drawBtn;
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
      fillColor: "color",
      fillOpacity: 0.05,
      strokeOpacity: 0.9,
      editable: true,
      draggable: true,
      suppressUndo: true,
      clickable: true,
    },
  });
}

function appendAddPolygon(polygon) {
  addPolygons.push(polygon);
}

function appendSubPolygon(polygon) {
  subPolygons.push(polygon);
}

function calculateTotalArea() {
  let totalArea = 0;
  for (const area of addPolygons) {
    totalArea += getAreaOfPolygon(getPolygonArray(area));
  }
  for (const area of subPolygons) {
    totalArea -= getAreaOfPolygon(getPolygonArray(area));
  }
  return convertArea(totalArea, "ft2");
}

function getPolygonArray(polygon) {
  return polygon
    .getPath()
    .getArray()
    .map((p) => [p.lat(), p.lng()]);
}

// window.initMap = initMap;
initMap();
