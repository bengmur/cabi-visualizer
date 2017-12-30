import React from 'react';
import { Radio, Row, Col } from "react-bootstrap";

export default class RadioBar extends React.Component {
    render() {
        return (
            <Row>
                {this.props.availableInputs.map(({label, value}) => (
                    <Col key={value} sm={12} md={4} style={{display: 'flex', justifyContent: 'center'}}>
                        <Radio
                            name={this.props.name}
                            onChange={this.props.selectHandler}
                            checked={value == this.props.checkedValue}
                            value={value}
                        >
                            {label}
                        </Radio>
                    </Col>
                ))}
            </Row>
        );
    }
}
