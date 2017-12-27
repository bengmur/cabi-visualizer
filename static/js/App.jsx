import axios from "axios";
import React from "react";
import { PageHeader, Grid, Row, Col } from "react-bootstrap";

import HeatMapScaleBar from "./HeatMapScaleBar";
import PolylineHeatMap from "./PolylineHeatMap";
import LoginForm from "./LoginForm";
import StatusWell from "./StatusWell";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showMap: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLoginFormSubmit = this.handleLoginFormSubmit.bind(this);
    }

    handleInputChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    resetLoadingStates() {
        this.setState({loadingStates: []});
    }

    addLoadingState(loadingState) {
        this.setState(prevState => ({
            loadingStates: [
                ...prevState.loadingStates,
                loadingState
            ]
        }));
    }

    updateLoadingState(loadingState) {
        this.setState(prevState => {
            let loadingStates = prevState.loadingStates;
            loadingStates.pop();
            loadingStates.push(loadingState);
            return {loadingStates: loadingStates};
        });
    }

    handleLoginFormSubmit(e) {
        this.trips = [];
        this.setState({isLoadingData: true});
        this.resetLoadingStates();
        this.addLoadingState('Scraping your Capital Bikeshare trip data');
        axios.post('/api/locations', {
            username: this.state.username,
            password: this.state.password,
        }).catch((error) => {
            if (error.response && error.response.status == 401) {
                this.addLoadingState('Capital Bikeshare authentication failed, check your login details');
                this.setState({isLoadingData: false});
                return Promise.reject(Error('auth'));
            }
            return Promise.reject(error);
        }).then((response) => {
            this.addLoadingState('Calculating normalized frequencies of unique trips');
            const locationPairs = response.data.data.location_pairs;
            return axios.post('/api/calculate-normalized-frequencies', {
                elements: locationPairs,
            });
        }).then((response) => {
            const normalizedLocationFrequencies = response.data.data.normalized_frequencies;
            this.setState({uniqueTripCount: normalizedLocationFrequencies.length});
            this.addLoadingState(`Generating trip polylines (0 of ${this.state.uniqueTripCount})`);
            return Promise.all(normalizedLocationFrequencies.map((locationData) => (
                axios.post('/api/maps/routing-polyline', {
                    start: locationData.element[0],
                    end: locationData.element[1],
                    mode: 'bicycling'
                }).then((response) => {
                    this.trips.push({
                        path: response.data.data.polyline,
                        weight: locationData.frequency,
                    });
                    this.updateLoadingState(
                        `Generating trip polylines (${this.trips.length} of ${this.state.uniqueTripCount})`
                    );
                })
            )));
        }).then(() => {
            this.addLoadingState('Fetching Google Maps API key');
            return axios.get('/api/maps/api-key');
        }).then((response) => {
            this.setState({
                googleMapsApiKey: response.data.data.maps_api_key,
                showMap: true
            });
        }).catch((error) => {
            if (error.message !== 'auth') {
                this.addLoadingState('Uh oh, something went wrong');
                this.setState({isLoadingData: false});
            }
        });

        e.preventDefault();
    }

    render() {
        return (
            <Grid fluid={true}>
                <Row>
                    <Col xs={12}>
                        <PageHeader>Capital Bikeshare Member Data Visualizer</PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        {this.state.showMap ? [
                             <HeatMapScaleBar key="0" lowerBound={1} upperBound={this.state.uniqueTripCount} />,
                             <PolylineHeatMap key="1" apiKey={this.state.googleMapsApiKey} weightedPolylines={this.trips} />
                        ] : [
                             this.state.loadingStates && <StatusWell key="0" statuses={this.state.loadingStates} />,
                             <LoginForm
                                 key="1"
                                 handleInputChange={this.handleInputChange}
                                 handleLoginFormSubmit={this.handleLoginFormSubmit}
                                 isLoading={this.state.isLoadingData}
                                 loadingText="Generating Visualization..."
                                 submitText="Generate Visualization" />
                        ]}
                    </Col>
                </Row>
            </Grid>
        );
    }
}
