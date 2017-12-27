import PolylineLib from "polyline";
import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps";

export default class PolylineHeatMap extends React.Component {
    getHeatMapColorHex(weight) {
        /* 0 <= weight <= 1 */

        let gradientColors;
        let weightBetweenColors;
        if (weight < 0.5) {
            /* Green to yellow */
            gradientColors = [[0,255,0], [255,255,0]];
            /* Normalize weight from [0, 0.5) to [0, 1) */
            weightBetweenColors = weight / 0.5;
        } else {
            /* Yellow to red */
            gradientColors = [[255,255,0], [255,0,0]];
            /* Normalize weight from [0.5, 1] to [0, 1] */
            weightBetweenColors = (weight - 0.5) / 0.5;
        }

        const fromColor = gradientColors[0];
        const toColor = gradientColors[1];
        const fromWeight = 1 - weightBetweenColors;
        const toWeight = weightBetweenColors;
        const rgbColor = [0, 1, 2].map(i => (
            Math.round(fromColor[i] * fromWeight + toColor[i] * toWeight)
        ));

        const hexColor = '#' + rgbColor.map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');

        return hexColor;
    }

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
                {this.props.weightedPolylines.map((weightedPolyline) => (
                    <Polyline
                        key={weightedPolyline.path}
                        path={this.getLatLngsFromEncodedPath(weightedPolyline.path)}
                        options={{strokeColor: this.getHeatMapColorHex(weightedPolyline.weight), zIndex: weightedPolyline.weight}}
                    />
                ))}
            </GoogleMap>
        ));
        const wrapper = <div style={{ height: `100%` }} />;

        return (
            <Map
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&v=3.exp&libraries=drawing`}
                loadingElement={wrapper}
                containerElement={wrapper}
                mapElement={wrapper}
            />
        );
    }
}
