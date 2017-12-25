import PolylineLib from "polyline";
import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps";

export default class PolylineMap extends React.Component {
    getLatLngsFromEncodedPath(encodedPath) {
        const decodedPath = PolylineLib.decode(encodedPath);
        const latLngs = decodedPath.map((rawLatLng) => (
            { lat: rawLatLng[0], lng: rawLatLng[1] }
        ));
        return latLngs;
    }

    render() {
        const Map = withScriptjs(withGoogleMap((props) =>
            <GoogleMap
                defaultZoom={13}
                defaultCenter={{ lat: 38.898, lng: -77.035 }}
            >
                {this.props.encodedPaths.map((encodedPath) => (
                    <Polyline
                        key={encodedPath}
                        path={this.getLatLngsFromEncodedPath(encodedPath)}
                        options={{strokeColor: "#000"}}
                    />
                ))}
            </GoogleMap>
        ));
        const wrapper = <div style={{ height: `100%` }} />;

        return (
            <Map
                googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=drawing"
                loadingElement={wrapper}
                containerElement={wrapper}
                mapElement={wrapper}
            />
        );
    }
}
