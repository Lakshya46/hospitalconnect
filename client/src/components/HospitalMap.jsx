import { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "../styles/Hospitals.css";

/* -------- SAMPLE DATA -------- */

const hospitals = [
  {
    id: 1,
    name: "AIIMS Bhopal",
    type: "Government",
    address: "Saket Nagar",
    beds: 300,
    position: [23.2086, 77.46]
  },
  {
    id: 2,
    name: "Heart Care Institute",
    type: "Cardiac",
    address: "MP Nagar",
    beds: 120,
    position: [23.2599, 77.4126]
  },
  {
    id: 3,
    name: "Cancer Care Center",
    type: "Cancer",
    address: "Arera Colony",
    beds: 90,
    position: [23.235, 77.401]
  },
  {
    id: 4,
    name: "City Children Hospital",
    type: "Pediatric",
    address: "Kolar Road",
    beds: 80,
    position: [23.27, 77.39]
  }
];

/* -------- DISTANCE FUNCTION -------- */

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* -------- LOCATION BUTTON -------- */

function LocateButton({ setUserLocation }) {
  const map = useMap();

  const handleClick = () => {
    map.locate().on("locationfound", (e) => {
      const pos = [e.latlng.lat, e.latlng.lng];
      setUserLocation(pos);
      map.setView(pos, 14);
    });
  };

  return (
    <button className="locate-btn" onClick={handleClick}>
      📍 My Location
    </button>
  );
}

/* -------- MAIN COMPONENT -------- */

export default function Hospitals() {
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef();

  const hospitalsWithDistance = userLocation
    ? hospitals
        .map((h) => ({
          ...h,
          distance: getDistance(
            userLocation[0],
            userLocation[1],
            h.position[0],
            h.position[1]
          )
        }))
        .sort((a, b) => a.distance - b.distance)
    : hospitals;

  const focusHospital = (h) => {
    if (mapRef.current) {
      mapRef.current.setView(h.position, 15);
    }
  };

  return (
    <div className="hospital-layout">

      {/* -------- LEFT PANEL -------- */}

      <div className="side-panel">
        <h3>Nearest Hospitals</h3>

        {hospitalsWithDistance.map((h) => (
          <div
            key={h.id}
            className="side-card"
            onClick={() => focusHospital(h)}
          >
            <strong>{h.name}</strong>
            <p>{h.type}</p>

            {userLocation && (
              <p className="distance">
                {h.distance.toFixed(2)} km away
              </p>
            )}
          </div>
        ))}
      </div>

      {/* -------- MAP -------- */}

      <MapContainer
        center={[23.2599, 77.4126]}
        zoom={13}
        className="map"
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* USER LOCATION MARKER */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* HOSPITAL MARKERS */}
        {hospitals.map((h) => (
          <Marker key={h.id} position={h.position}>
            <Popup>
              <strong>{h.name}</strong><br />
              Type: {h.type}<br />
              Beds: {h.beds}
            </Popup>
          </Marker>
        ))}

        <LocateButton setUserLocation={setUserLocation} />
      </MapContainer>
    </div>
  );
}