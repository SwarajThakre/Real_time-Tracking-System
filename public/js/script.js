const socket = io();
console.log('connected');

const markers = {};

const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let myMarker = null;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit('location', { latitude, longitude });

      if (!myMarker) {
        myMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'my-marker',
            html: '📍',
            iconSize: [60, 60],
          }),
        }).addTo(map);
      } else {
        myMarker.setLatLng([latitude, longitude]);
      }
      map.setView([latitude, longitude], 15);
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      distanceFilter: 10,
    }
  );
}

socket.on('receiveLocation', (data) => {
  const { id, latitude, longitude } = data;

  if (id === socket.id) return;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'other-marker',
        html: '🚗',
        iconSize: [80, 80],
      }),
    }).addTo(map);

    markers[id].bindPopup(`User: ${id.substring(0, 6)}`).openPopup();
  }
});

socket.on('disconnect', () => {
  console.log('disconnected');
});

socket.on('userDisconnected', (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
