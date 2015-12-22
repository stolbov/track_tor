  function showPopup (src, targ, close) {
    var srcNode = document.getElementById(src);
    var targNode = document.getElementById(targ);
    var closeNode = document.getElementById(close);
    targNode.style.display = "none";
    srcNode.onclick = function () {
      targNode.style.display = "block";
    }
    closeNode.onclick = function () {
      targNode.style.display = "none";
    }
  }
  
  showPopup('question', 'questPopup', 'closePopup');
  
  var reportServerUrl = 'http://tractor-reports.cloudapp.net';

  var map = L.map('map').setView([56.144564, 47.252676], 11);
  var featureNames = {};
  var q = {expression: '1=1', value: null};
  var direction = document.getElementById("direction");
  var osm = {
            tileLayer: L.tileLayer('http://gwosm.cloudapp.net/osm/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://osm.org/copyright">OSM</a> contributors'
                }),
            title: 'Open Street Map',
            name: 'gwosm',
            thumb: 'images/osm.png'
        };
  map.addLayer(osm.tileLayer);
  
  var icons = {
  1: L.icon({
      iconUrl: '/geoworks/tractors/1.png',
      iconSize: [27, 31],
      iconAnchor: [13.5, 13.5],
      popupAnchor: [0, -11]
    }),
  2: L.icon({
      iconUrl: '/geoworks/tractors/2.png',
      iconSize: [27, 31],
      iconAnchor: [13.5, 13.5],
      popupAnchor: [0, -11]
    }),
  3: L.icon({
      iconUrl: '/geoworks/tractors/3.png',
      iconSize: [27, 31],
      iconAnchor: [13.5, 13.5],
      popupAnchor: [0, -11]
    }),
  4: L.icon({
      iconUrl: '/geoworks/tractors/4.png',
      iconSize: [27, 31],
      iconAnchor: [13.5, 13.5],
      popupAnchor: [0, -11]
    })
  };
  var ukNames = {};
  var to = null;
  //L.esri.basemapLayer('Streets').addTo(map);
  var stops = L.esri.featureLayer({
    url: 'http://sdi.cap.ru/arcgis/rest/services/cheb/cheb_zhkh_tractors/FeatureServer/0',
    pointToLayer: function (geojson, latlng) {
    ukNames[geojson.properties.ukName] = true;
    clearTimeout(to);
    to = setTimeout(function () {
      Object.keys(ukNames).forEach(function (ukName) {
      var option = document.createElement("option");
      option.text = ukName;
      option.value = ukName;
      direction.add(option);
    });
    }, 500);
      return L.marker(latlng, {
        icon: icons[Math.floor((Math.random() * 4) + 1)]
      });
    }
  }).addTo(map);
  function zoomToFeature (controllerId) {
    var bounds = L.latLngBounds([]);
  var i = 0;
  stops.eachFeature(function (layer) {
    i += 1;
    if (layer.feature.properties.controllerId === controllerId) {
      var layerLatLng = layer.getLatLng();
      bounds.extend(layerLatLng);
    //console.log(layer);
    //layer._popup.openOn(map);
    }
  });
  map.fitBounds(bounds, { maxZoom: 16 });
  }
  function zoomToFeatures () {
    var bounds = L.latLngBounds([]);
  var i = 0;
  stops.eachFeature(function (layer) {
    i += 1;
    if (layer.feature.properties.ukName === q.value || !q.value) {
      var layerLatLng = layer.getLatLng();
      bounds.extend(layerLatLng);
    }
  });
  map.fitBounds(bounds, { maxZoom: 16 });
  }
  stops.on('load', function (evt) {
    zoomToFeatures();
  stops.off('load');
  });
  
  stops.on('loading', function (evt) {
    map.closePopup();
  updateTable();
  stops.bindPopup(function (feature) {
  var truckId = feature.properties.dNumber.slice(0, 2) + feature.properties.dNumber.slice(3, 5);
    return L.Util.template('<p>Время: <strong>{time}</strong><br>Организация: ' + 
  '{ukName}<br>Номер: {dNumber}' + 
  '<br>Загрузить отчет: <span title="Загрузить отчет"><a href="' +  reportServerUrl + '/reports/' + truckId + '"><img src="/geoworks/tractors/file_pdf.png" height=20></img></a></span></p>', feature.properties);
  });
  });
  /**/
  direction.addEventListener('change', function(){
  if (direction.value === 'all') {
    q.expression = '1=1';
    q.value = null;
  } else {
    q.expression = 'ukName=\'' + direction.value + '\'';
    q.value = direction.value;
  }
  setWhere();
  zoomToFeatures();
  });
  function setWhere () {
    stops.setWhere(q.expression);
  }
  var upIinterval = setInterval(function(){
    setWhere();
  }, 10000);
  
  function updateTable () {
    stops.eachFeature(function (layer) {
    featureNames[layer.feature.properties.controllerId] = layer.feature.properties;
  });
  var tableTr = document.getElementById('tableTr');
  tableTr.innerHTML = "";
  
  var tr = document.createElement("tr");
  
  var th = document.createElement("th");
  var div = document.createElement("div");
  var img = document.createElement("img");
  img.height = 20;
  img.src = "/geoworks/tractors/document_down.png";
  
  div.appendChild(img);
  th.appendChild(div);
  tr.appendChild(th);
  
  var th = document.createElement("th");
  var div = document.createElement("div");
  div.innerHTML = "Номер";
  th.appendChild(div);
  tr.appendChild(th);
  
  var th = document.createElement("th");
  var div = document.createElement("div");
  div.innerHTML = "Время";
  th.appendChild(div);
  tr.appendChild(th);
  
  tableTr.appendChild(tr);  
  
  
  Object.keys(featureNames).forEach(function (key) {
      if (featureNames[key].ukName === q.value || !q.value) {
    
      var tr = document.createElement("tr");
      
      var td = document.createElement("td");
      var div = document.createElement("div");
      var reportAnchor = document.createElement("a");
      
      var truckId = featureNames[key].dNumber.slice(0, 2) + featureNames[key].dNumber.slice(3, 5);
      reportAnchor.href = reportServerUrl + "/reports/" + truckId;
      var img = document.createElement("img");
      img.height = 20;
      img.src = "/geoworks/tractors/file_pdf.png";
      div.title = "Загрузить отчет";
      reportAnchor.appendChild(img);
      div.appendChild(reportAnchor);
      td.appendChild(div);
      td.style.cursor = 'pointer';
      tr.appendChild(td);
      
      var td = document.createElement("td");
      var div = document.createElement("div"); 
      
      div.innerHTML = featureNames[key].dNumber;
      div.title = "Найти на карте";
      td.appendChild(div);
      td.style.cursor = 'pointer'; 
      td.addEventListener("click", function() {
        zoomToFeature(key);
      });
      tr.appendChild(td);
      
      var td = document.createElement("td");
      var div = document.createElement("div"); 
      
      var pTime = featureNames[key].time;
      /*if (pTime) {
        // DIRTY CODE :D
        var pT = pTime.match(/.*,/);
        var pT = pT[0].substring(0, pT[0].length - 1).split('.');
      
        pTime = new Date(pT[2], pT[1]-1, pT[0]);
        var today = new Date().getDate();
        var pDay = pTime.getDate();
        if (today === pDay) {
        
        pTime = new Date(featureNames[key].time).toLocaleTimeString();
        } else {
        pTime = featureNames[key].time;
        }
      }*/
      div.innerHTML = pTime;
      div.title = "Время посл. принятых коодринат";
      td.appendChild(div); 
      td.addEventListener("click", function() {
        zoomToFeature(key);
      });
      tr.appendChild(td);
      
      tableTr.appendChild(tr);
    }
  });
  }
