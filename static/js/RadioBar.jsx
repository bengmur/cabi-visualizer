import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { colors } from './styles/variables';

export default class RadioBar extends React.Component {
    render() {
        return (
            <div className={css(styles.container)}>
                {this.props.availableInputs.map(({label, value}) => (
                    <div className={css(styles.radioWrapper)} key={value}>
                        <input type="radio"
                            id={value}
                            name={this.props.name}
                            onChange={this.props.selectHandler}
                            checked={value == this.props.checkedValue}
                            value={value}
                        />
                        <label className={css(styles.label)} htmlFor={value}>{label}</label>
                    </div>
                ))}
            </div>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column'
    },

    radioWrapper: {
        fontSize: '12px', // Affects radio size too
        marginBottom: '10px'
    },

    label: {
        color: colors.heavy,
        paddingLeft: '10px',
        textTransform: 'uppercase',
        fontWeight: '300',
        letterSpacing: '1px'
    }
});
