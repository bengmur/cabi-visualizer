import React from "react";
import { FormGroup, ControlLabel, FormControl, Button } from "react-bootstrap";

export default class LoginForm extends React.Component {
    render() {
        return (
            <form onSubmit={this.props.isLoading ? null : this.props.handleLoginFormSubmit}>
                <FormGroup controlId="username">
                    <ControlLabel>Username</ControlLabel>
                    <FormControl
                        name="username"
                        type="text"
                        onChange={this.props.handleInputChange}
                    />
                </FormGroup>
                <FormGroup controlId="password">
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                        name="password"
                        type="password"
                        onChange={this.props.handleInputChange}
                    />
                </FormGroup>
                <Button
                    type="submit"
                    bsStyle="primary"
                    bsSize="large"
                    block
                    disabled={this.props.isLoading}
                >
                    {this.props.isLoading ? this.props.loadingText : this.props.submitText}
                </Button>
            </form>
        );
    }
}
