import PolylineLib from "@mapbox/polyline";
import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps";

const Map = withScriptjs(withGoogleMap((props) => (
    <GoogleMap
        defaultCenter={props.defaultCenter}
        defaultZoom={props.defaultZoom}
    >
        {props.children}
    </GoogleMap>
)));

export default class PolylineHeatMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {polylines: props.weightedPolylines};
    }

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
        const wrapper = <div style={{ height: `100%` }} />;
        return (
            <Map
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&v=3.exp&libraries=drawing`}
                defaultZoom={13}
                defaultCenter={{ lat: 38.898, lng: -77.035 }}
                loadingElement={wrapper}
                containerElement={wrapper}
                mapElement={wrapper}
            >
                {this.state.polylines.map((polyline) => (
                    <Polyline
                        key={polyline.path}
                        path={this.getLatLngsFromEncodedPath(polyline.path)}
                        options={{
                            strokeColor: this.getHeatMapColorHex(polyline.weight),
                            zIndex: polyline.weight
                        }}
                    />
                ))}
            </Map>
        );
    }
}
