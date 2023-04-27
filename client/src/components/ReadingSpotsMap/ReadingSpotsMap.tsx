import { useState, useMemo, useCallback, useRef } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Places from "./places";
import "../../styles/mapstyles.css";
// import { SpotContainer, Controls, Map, MapContainer } from "../../pages/style";

type LatLngLiteral = google.maps.LatLngLiteral;
type MapOptions = google.maps.MapOptions;


function ReadingSpotsMap() {
  const [office, setOffice] = useState<LatLngLiteral>();
  // console.log("office data", office);
  const [address, setAddress] = useState<string>("");
  // console.log("address data", address);

  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const mapRef = useRef<GoogleMap>()
  const center = useMemo<LatLngLiteral>(() => ({ lat: 29.9511, lng: -90.0715 }), []);
  const options = useMemo<MapOptions>(() => ({
    mapId: "89f1db752bd023d1",
    disableDefaultUI: true,
    clickableIcons: false,
  }), []);

  const onLoad = useCallback((map: any) => (mapRef.current = map), []);

  const handleMarkerClick = useCallback(() => {
    setShowInfoWindow((prev) => !prev);
  }, []);

  return (
    <div className="spots-container">
      <div className="controls">
        <h1>Enter your favorite reading spots</h1>
        <Places
          setOffice={(position: any) => {
            setOffice(position);
            mapRef.current?.panTo(position);
          }}
          setAddress={setAddress}
        />
      </div>
      <div className="spots-map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {office && (
            <Marker
              position={office}
              onClick={handleMarkerClick}
              icon={{
                url: "http://maps.google.com/mapfiles/kml/shapes/library_maps.png",
              }}
            >
              {showInfoWindow && (
                <InfoWindow
                  onCloseClick={handleMarkerClick}
                  position={office}
                  options={{ maxWidth: 150 }}
                >
                  <div>{address}</div>
                </InfoWindow>
              )}
            </Marker>
          )}
        </GoogleMap>
      </div>
    </div>

    // <SpotContainer className="spots-container">
    //   <Controls className="controls">
    //     What are your favorite reading spots?
    //   </Controls>
    //   <Map className="spots-map">
    //     <GoogleMap
    //       zoom={10}
    //       center={center}
    //     ></GoogleMap>
    //   </Map>
    // </SpotContainer>
  )
}

export default ReadingSpotsMap;
