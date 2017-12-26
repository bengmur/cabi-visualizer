import axios from "axios";
import React from "react";
import { PageHeader, Grid, Row, Col } from "react-bootstrap";

import PolylineHeatMap from "./PolylineHeatMap";
import LoginForm from "./LoginForm";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoadingData: false,
            trips: null
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLoginFormSubmit = this.handleLoginFormSubmit.bind(this);
    }

    handleInputChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleLoginFormSubmit(e) {
        this.setState({isLoadingData: true});

        axios.post('/api/locations', {
            username: this.state.username,
            password: this.state.password,
        }).then((response) => {
            this.setState({trips: response.data})
        }).catch((error) => {
            console.log(error);
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
                        {this.state.trips ? (
                             <PolylineHeatMap encodedPaths={this.state.trips} />
                        ) : (
                             <LoginForm
                                 handleInputChange={this.handleInputChange}
                                 handleLoginFormSubmit={this.handleLoginFormSubmit}
                                 isLoading={this.state.isLoadingData}
                                 loadingText="Generating Visualization..."
                                 submitText="Generate Visualization" />
                        )}
                    </Col>
                </Row>
            </Grid>
        );
    }
}
