L.RandomTileLayer = L.TileLayer.extend({
  // These are taken from https://github.com/leaflet-extras/leaflet-providers/blob/master/leaflet-providers.js
	options: {
    providers: [
      {
        name: "Stamen Toner",
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
					'<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
        url: "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
      },
      {
        name: "Stamen Watercolor",
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
					'<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
        url: "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png"
      },
      {
        name: "ESRI WorldTopoMap",
        attribution: 'Tiles &copy; Esri &mdash; ' +
							'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        url: "//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
      },
      {
        name: "ESRI WorldImagery",
        attribution: 'Tiles &copy; Esri &mdash; ' +
							'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        url: "//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      },
      {
        name: "ESRI WorldTerrain",
        attribution: 'Tiles &copy; Esri &mdash; ' +
							'Source: USGS, Esri, TANA, DeLorme, and NPS',
        url: "//server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
      },
      {
        name: "ESRI WorldTerrain",
        attribution: 'Tiles &copy; Esri &mdash; ' +
							'Esri, DeLorme, NAVTEQ',
        url: "//server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      },
      {
        name: "Acetate Base",
        attribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
        url: "http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png"
      },
      {
        name: "CartoDB DarkMatter",
        attribution: '{attribution.OpenStreetMap} &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        url: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      },
      {
        name: "CartoDB Positron",
        attribution: '{attribution.OpenStreetMap} &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
      },
      {
        name: "OSM",
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      },
      {
        name: "OSM France",
        attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        url: "http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
      },
      {
        name: "Thunderforest Outdoors",
        attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}',
        url: "//{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
      },
      {
        name: "Thunderforest Transport Dark",
        attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}',
        url: "//{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png"
      },
      {
        name: "OpenMapSurfer Greyscale",
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data, {attribution.OpenStreetMap}',
        url: "http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}"
      }
    ],
		maxZoom: 18,

		subdomains: 'abc',
		errorTileUrl: '',
		zoomOffset: 0,

		maxNativeZoom: null, // Number
		tms: false,
		zoomReverse: false,
		detectRetina: false,
		crossOrigin: false
	},

	initialize: function (options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			options.minZoom = Math.max(0, options.minZoom);
			options.maxZoom--;
		}

		if (typeof options.subdomains === 'string') {
			options.subdomains = options.subdomains.split('');
		}

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!L.Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
	},

	setUrl: function (url, noRedraw) {
		this._url = this._getUrl();

		if (!noRedraw) {
			this.redraw();
		}
		return this;
	},

	getTileUrl: function (coords) {
		return L.Util.template(this._getUrl(), L.extend({
			r: this.options.detectRetina && L.Browser.retina && this.options.maxZoom > 0 ? '@2x' : '',
			s: this._getSubdomain(coords),
			x: coords.x,
			y: this.options.tms ? this._globalTileRange.max.y - coords.y : coords.y,
			z: this._getZoomForUrl()
		}, this.options));
	},

  _getUrl: function() {
    return this.options.providers[Math.floor(Math.random() * (this.options.providers.length))].url;
  }
});

L.randomTileLayer = function (options) {
	return new L.RandomTileLayer(options);
};
