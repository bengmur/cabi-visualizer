import axios from "axios";
import React from "react";
import { PageHeader, Well, Grid, Row, Col } from "react-bootstrap";

import PolylineHeatMap from "./PolylineHeatMap";
import LoginForm from "./LoginForm";

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
            this.uniqueTripCount = normalizedLocationFrequencies.length;
            this.setState(prevState => ({
                loadingStates: [
                    ...prevState.loadingStates,
                    `Generating trip polylines (0 of ${this.uniqueTripCount})`
                ]
            }));
            for (let locationData of normalizedLocationFrequencies) {
                axios.post('/api/routing-polyline', {
                    start: locationData.element[0],
                    end: locationData.element[1],
                    mode: 'bicycling'
                }).then((response) => {
                    this.trips.push(response.data.data.polyline);
                    this.setState(prevState => {
                        let loadingStates = prevState.loadingStates;
                        loadingStates.pop();
                        loadingStates.push(`Generating trip polylines (${this.trips.length} of ${this.uniqueTripCount})`);
                        return {loadingStates: loadingStates};
                    });

                    if (this.trips.length === this.uniqueTripCount) {
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
                        {this.state.tripsLoaded ? (
                             <PolylineHeatMap encodedPaths={this.trips} />
                        ) : [
                             this.state.isLoadingData && (
                                 <Well key="well">
                                     {this.state.loadingStates.map((loadingState) => (
                                         <p key={loadingState}>{loadingState}</p>
                                     ))}
                                 </Well>
                             ),
                             <LoginForm
                                 key="form"
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
