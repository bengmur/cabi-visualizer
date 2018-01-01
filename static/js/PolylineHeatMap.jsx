import PolylineLib from '@mapbox/polyline';
import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from 'react-google-maps';
import InfoBox from 'react-google-maps/lib/components/addons/InfoBox';

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
        this.state = {
            activePolyline: null,
            infoBox: {}
        };
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

    handlePolylineMouseOver(e, polyline) {
        this.setState({
            activePolyline: polyline.path,
            infoBox: {isVisible: true, position: e.latLng, activePolyline: polyline}
        });
    }

    handlePolylineMouseMove(e, polyline) {
        this.setState(prevState => ({infoBox: {...prevState.infoBox, position: e.latLng}}));
    }

    handlePolylineMouseOut(e, polyline) {
        this.setState({
            activePolyline: null,
            infoBox: {isVisible: false}
        });
    }

    render() {
        const wrapper = <div style={{height: '100%'}} />;
        return (
            <Map
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${this.props.apiKey}&v=3.exp&libraries=drawing`}
                defaultZoom={13}
                defaultCenter={{lat: 38.898, lng: -77.035}}
                loadingElement={wrapper}
                containerElement={wrapper}
                mapElement={wrapper}
            >
                {this.state.infoBox.isVisible && (
                    <InfoBox position={this.state.infoBox.position} options={{closeBoxURL: ''}}>
                        <div style={{backgroundColor: '#FFF', padding: '10px', whiteSpace: 'nowrap', borderRadius: '0 10px 10px 10px'}}>
                            <div style={{userSelect: 'none'}}>
                                <p style={{marginTop: 0}}>From: {this.state.infoBox.activePolyline.waypoints[0].name}</p>
                                <p>To: {this.state.infoBox.activePolyline.waypoints[this.state.infoBox.activePolyline.waypoints.length - 1].name}</p>
                                <p style={{marginBottom: 0}}>Total Trips: {this.state.infoBox.activePolyline.statistics.frequency.value}</p>
                            </div>
                        </div>
                    </InfoBox>
                )}
                {this.props.polylines.map((polyline, i) => {
                    const normalizedWeight = polyline.statistics[this.props.weightKey].normalized_value;
                    const isActive = this.state.activePolyline === polyline.path;
                    return (
                        <Polyline
                            key={polyline.path}
                            path={PolylineLib.decode(polyline.path).map((rawLatLng) => ({lat: rawLatLng[0], lng: rawLatLng[1]}))}
                            options={{
                                strokeColor: isActive ? '#0088FF' : this.getHeatMapColorHex(normalizedWeight),
                                strokeWeight: 6,
                                zIndex: isActive ? 2000 : normalizedWeight*1000 // Scale up values <=1 for zIndex
                            }}
                            onMouseOver={e => this.handlePolylineMouseOver(e, polyline)}
                            onMouseMove={e => this.handlePolylineMouseMove(e, polyline)}
                            onMouseOut={e => this.handlePolylineMouseOut(e, polyline)}
                        />
                    );
                })}
            </Map>
        );
    }
}
