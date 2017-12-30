import axios from "axios";
import React from "react";
import { PageHeader, Grid, Row, Col } from "react-bootstrap";

import HeatMapScaleBar from "./HeatMapScaleBar";
import PolylineHeatMap from "./PolylineHeatMap";
import LoginForm from "./LoginForm";
import RadioBar from "./RadioBar";
import StatusWell from "./StatusWell";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showMap: false,
            statisticType: 'normalized_frequency'
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
            let loadingStates = prevState.loadingStates.slice();
            loadingStates.pop();
            loadingStates.push(loadingState);
            return {loadingStates: loadingStates};
        });
    }

    handleLoginFormSubmit(e) {
        this.routes = [];
        this.setState({isLoadingData: true});
        this.resetLoadingStates();
        this.addLoadingState('Scraping and analyzing your Capital Bikeshare trip data');
        axios.post('/api/routes/stats', {
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
            const routes = response.data.data.route_stats;
            this.uniqueRoutes = routes.length;
            this.addLoadingState(`Generating route polylines (0 of ${this.uniqueRoutes})`);
            return Promise.all(routes.map((route) => (
                axios.post('/api/maps/polyline', {
                    start: `${route.waypoints[0].latitude}, ${route.waypoints[0].longitude}`,
                    end: `${route.waypoints[route.waypoints.length - 1].latitude}, ${route.waypoints[route.waypoints.length - 1].longitude}`,
                    mode: 'bicycling'
                }).then((response) => {
                    this.routes.push({
                        ...route,
                        path: response.data.data.polyline,
                    });
                    this.updateLoadingState(
                        `Generating route polylines (${this.routes.length} of ${this.uniqueRoutes})`
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
                console.error(error);
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
                             <RadioBar
                                 key="0"
                                 name="statisticType"
                                 checkedValue={this.state.statisticType}
                                 availableInputs={[
                                     {label: 'Trip Frequency', value: 'normalized_frequency'},
                                     {label: 'Average Time Traveled', value: 'normalized_avg_duration'},
                                     {label: 'Total Time Traveled', value: 'normalized_total_duration'}
                                 ]}
                                 selectHandler={this.handleInputChange} />,
                             <HeatMapScaleBar key="1"
                                              lowerBound={Math.min(...routes.map(route => route[this.state.statisticType]))}
                                              upperBound={Math.max(...routes.map(route => route[this.state.statisticType]))} />,
                             <PolylineHeatMap key="2" apiKey={this.state.googleMapsApiKey} polylines={this.routes} weightKey={this.state.statisticType} />
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
