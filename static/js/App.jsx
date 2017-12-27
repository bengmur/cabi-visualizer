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
            isLoading: false,
            loadingStates: [],
            tripsLoaded: false
        };

        this.trips = [];

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLoginFormSubmit = this.handleLoginFormSubmit.bind(this);
    }

    handleInputChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleLoginFormSubmit(e) {
        this.setState({isLoadingData: true});
        this.setState(prevState => ({
            loadingStates: [
                ...prevState.loadingStates,
                'Scraping your Capital Bikeshare trip data'
            ]
        }));
        axios.post('/api/locations', {
            username: this.state.username,
            password: this.state.password,
        }).then((response) => {
            this.setState(prevState => ({
                loadingStates: [
                    ...prevState.loadingStates,
                    'Calculating normalized frequencies of unique trips'
                ]
            }));
            const locationPairs = response.data.data.location_pairs;
            return axios.post('/api/calculate-normalized-frequencies', {
                elements: locationPairs,
            });
        }).then((response) => {
            const normalizedLocationFrequencies = response.data.data.normalized_frequencies;
            this.setState({uniqueTripCount: normalizedLocationFrequencies.length});
            this.setState(prevState => ({
                loadingStates: [
                    ...prevState.loadingStates,
                    `Generating trip polylines (0 of ${this.state.uniqueTripCount})`
                ]
            }));
            for (let locationData of normalizedLocationFrequencies) {
                axios.post('/api/routing-polyline', {
                    start: locationData.element[0],
                    end: locationData.element[1],
                    mode: 'bicycling'
                }).then((response) => {
                    this.trips.push({
                        path: response.data.data.polyline,
                        weight: locationData.frequency,
                    });
                    this.setState(prevState => {
                        let loadingStates = prevState.loadingStates;
                        loadingStates.pop();
                        loadingStates.push(`Generating trip polylines (${this.trips.length} of ${this.state.uniqueTripCount})`);
                        return {loadingStates: loadingStates};
                    });

                    if (this.trips.length === this.state.uniqueTripCount) {
                        this.setState({tripsLoaded: true});
                    }
                });
            }
        })
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
                        {this.state.tripsLoaded ? [
                             <HeatMapScaleBar key="0" lowerBound={1} upperBound={this.state.uniqueTripCount} />,
                             <PolylineHeatMap key="1" weightedPolylines={this.trips} />
                        ] : [
                             this.state.isLoadingData && <StatusWell key="0" statuses={this.state.loadingStates} />,
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
