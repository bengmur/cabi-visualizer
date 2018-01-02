import { StyleSheet, css } from 'aphrodite';
import React from 'react';

import { colors } from './styles/variables';

export default class SvgRadioInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {active: false};

        this.setActive = this.setActive.bind(this);
        this.setNotActive = this.setNotActive.bind(this);
    }

    setActive() {
        this.setState({active: true});
    }

    setNotActive() {
        this.setState({active: false});
    }

    render() {
        return (
            <label
                className={css(styles.label)}
                onMouseDown={this.setActive}
                onMouseUp={this.setNotActive}
                onMouseLeave={this.setNotActive}
            >
                <input
                    type="radio"
                    name={this.props.name}
                    value={this.props.value}
                    checked={this.props.checked}
                    className={css(styles.notDisplayed)}
                    onChange={this.props.onChange}
                />
                <div
                    className={css(
                        styles.svgWrapper,
                        this.state.active && styles.svgWrapperActive,
                        this.props.checked && styles.svgWrapperChecked,
                        this.state.active && this.props.checked && styles.svgWrapperCheckedAndActive
                    )}
                >
                    {/* SVG child */
                        React.cloneElement(this.props.children, {
                            height: svgSize,
                            width: svgSize,
                            className: css(
                                styles.svgInput,
                                this.props.checked && styles.svgInputChecked
                            )
                        })}
                </div>
                <span className={css(
                    styles.text,
                    this.state.active && styles.textActive,
                    this.props.checked && styles.textChecked,
                    this.state.active && this.props.checked && styles.textCheckedAndActive
                )}>
                    {this.props.label}
                </span>
            </label>
        );
    }
}

const buttonSize = 16;
const svgSize = buttonSize - 4;
const styles = StyleSheet.create({
    label: {
        display: 'flex',
        marginBottom: '10px',
        cursor: 'pointer'
    },

    notDisplayed: {
        display: 'none'
    },

    svgWrapper: {
        boxSizing: 'border-box',
        boxShadow: '0 1px 2px rgba(0,0,0,0.10), 0 1px 1px rgba(0,0,0,0.07)',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

        height: `${buttonSize}px`,
        width: `${buttonSize}px`,

        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '4px',

        backgroundColor: colors.white,
        borderColor: colors.muted
    },

    svgWrapperActive: {
        backgroundColor: colors.mutedLighter
    },

    svgWrapperChecked: {
        backgroundColor: colors.active,
        borderColor: colors.activeDarker
    },

    svgWrapperCheckedAndActive: {
        backgroundColor: colors.activeDark
    },

    svgInput: {
        fill: colors.muted,

    },

    svgInputChecked: {
        fill: colors.white
    },

    text: {
        lineHeight: `${buttonSize}px`,
        color: colors.heavy,
        fontSize: '12px',
        paddingLeft: '10px',
        textTransform: 'uppercase',
        fontWeight: '300',
        letterSpacing: '1px'
    },

    textActive: {
        color: colors.heavyDark
    },

    textChecked: {
        color: colors.active,
        fontWeight: '400'
    },

    textCheckedAndActive: {
        color: colors.activeDark
    }
});
