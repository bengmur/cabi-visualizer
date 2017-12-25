import axios from "axios";
import React from "react";
import { Panel } from "react-bootstrap";

import PolylineMap from "./PolylineMap";
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
            <Panel
                header="Capital Bikeshare Member Data Visualizer"
                bsStyle="primary"
            >
                {this.state.trips ? (
                     <PolylineMap encodedPaths={this.state.trips} />
                ) : (
                     <LoginForm
                         handleInputChange={this.handleInputChange}
                         handleLoginFormSubmit={this.handleLoginFormSubmit}
                         isLoading={this.state.isLoadingData}
                         loadingText="Generating Visualization..."
                         submitText="Generate Visualization" />
                )}
            </Panel>
        );
    }
}
