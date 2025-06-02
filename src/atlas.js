import L from "leaflet";

const center_x = 0;
const center_y = 0;
const scale_x = 0.0005;
const scale_y = 0.0005;

const CUSTOM_CRS = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,
    scale: function(zoom) {

        return Math.pow(2, zoom);
    },
	transformation: new L.Transformation(scale_x, center_x, -scale_y, center_y),
    infinite: true
});


export { CUSTOM_CRS };


 var mapMinZoom = 0;
      var mapMaxZoom = 7;
      var mapMaxResolution = 0.25;
      var mapMinResolution = Math.pow(2, mapMaxZoom) * mapMaxResolution;
      var mapCenterLat = -5525;
      var mapCenterLng = 3755;
      var gtaOffset = 0.66;
      var debug = false;
      var overlay = false;
      var bottomLeft = [-8192, 0];
      var topRight = [0, 8192];
      var bounds = [bottomLeft, topRight];