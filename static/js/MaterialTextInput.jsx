import { StyleSheet, css } from 'aphrodite';
import React from 'react';

import { colors } from './styles/variables';

export default class MaterialTextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasInput: !!this.props.defaultValue
        };
    }

    checkForInput(e) {
        this.setState({hasInput: !!e.target.value.length});
    }

    render() {
        const isLabelFloating = this.state.hasInput || this.state.isFocused;
        return (
            <div className={css(styles.fillBox, styles.group)}>
                <input
                    className={css(
                        styles.fillBox,
                        styles.input,
                        this.props.type === 'password' && styles.password
                    )}
                    type={this.props.type || 'text'}
                    name={this.props.name}
                    onChange={e => {this.checkForInput(e); this.props.onChangeHandler && this.props.onChangeHandler(e);}}
                    onFocus={e => this.setState({isFocused: true})}
                    onBlur={e => this.setState({isFocused: false})}
                    defaultValue={this.props.defaultValue}
                    required={this.props.required && 'required'}
                />
                <span className={css(
                    styles.fillBox,
                    styles.bar,
                    this.state.isFocused && styles.focusedBar
                )} />
                <label
                    className={css(
                        styles.fillBox,
                        styles.label,
                        isLabelFloating && styles.floatingLabel,
                        this.state.isFocused && styles.focusedLabel
                    )}
                >
                    {this.props.label}
                </label>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    fillBox: {
        boxSizing: 'border-box'
    },

    group: {
        position: 'relative',
        margin: '20px 0px'
    },

    input: {
        background: 'none',
        color: colors.heavy,
        fontSize: '18px',
        padding: '10px 10px 10px 5px',
        display: 'block',
        width: '100%',
        borderRadius: '0',
        borderTop: '0',
        borderRight: '0',
        borderBottom: `1px solid ${colors.muted}`,
        borderLeft: '0',
        ':focus': {
            outline: 'none'
        },

    },

    password: {
        letterSpacing: '0.3em'
    },

    label: {
        color: colors.muted,
        fontSize: '16px',
        fontWeight: 'normal',
        position: 'absolute',
        pointerEvents: 'none',
        left: '5px',
        top: '10px',
        transition: '300ms ease all'
    },

    floatingLabel: {
        top: '-14px',
        fontSize: '12px'
    },

    focusedLabel: {
        color: colors.active,
    },

    bar: {
        position: 'relative',
        display: 'block',
        width: '100%',
        ':before': {
            content: '""',
            height: '2px',
            width: '0',
            bottom: '0px',
            position: 'absolute',
            background: colors.active,
            transition: '300ms ease all',
            left: '0%'
        }
    },

    focusedBar: {
        ':before': {
            width: '100%'
        }
    }
});
