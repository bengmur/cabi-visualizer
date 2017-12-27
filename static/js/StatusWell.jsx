import React from 'react';
import { Well } from "react-bootstrap";

export default class StatusWell extends React.Component {
    render() {
        return (
            this.props.statuses && (
                <Well>
                    {this.props.statuses.map((status, i) => (
                        <p
                            key={i}
                            style={i === this.props.statuses.length - 1 ? {marginBottom: '0'} : {}}>
                            {status}
                        </p>
                    ))}
                </Well>
            )
        )
    }
}
