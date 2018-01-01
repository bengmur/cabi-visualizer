import React from 'react';

import MaterialTextInput from './MaterialTextInput';
import MaterialButton from './MaterialButton';

export default class LoginForm extends React.Component {
    render() {
        return (
            <form onSubmit={this.props.isLoading ? null : this.props.handleLoginFormSubmit} style={{display: 'flex', flexDirection: 'column'}}>
                <MaterialTextInput
                    name="username"
                    label="Username"
                    defaultValue={this.props.defaultUsername}
                    onChangeHandler={this.props.handleInputChange}
                />
                <MaterialTextInput
                    name="password"
                    type="password"
                    label="Password"
                    defaultValue={this.props.defaultPassword}
                    onChangeHandler={this.props.handleInputChange}
                />

                <MaterialButton
                    type="submit"
                    disabled={this.props.isLoading}
                    highlight={true}
                    label={this.props.submitText}
                />
            </form>
        );
    }
}
