import { StyleSheet, css } from 'aphrodite';
import React from 'react';

import { colors } from './styles/variables';

export default class MaterialButton extends React.Component {
    render() {
        return (
            <button
                className={css(
                    styles.button,
                    this.props.muted && styles.muted,
                    this.props.highlight && styles.highlight,
                    this.props.disabled && styles.disabled
                )}
                type={this.props.type}
                disabled={this.props.disabled}
            >
                {this.props.label}
            </button>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        background: colors.white,
        color: colors.muted,
        cursor: 'pointer',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '3px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        textDecoration: 'none',
        outline: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        transition: 'all 0.3s cubic-bezier(.25, .8, .25, 1)',
        ':hover': {
            color: `mix(${colors.black}, ${colors.muted}, 30%)`,
            boxShadow: '0 7px 14px rgba(0, 0, 0, 0.18), 0 5px 5px rgba(0, 0, 0, 0.12)'
        }
    },

    muted: {
        background: colors.mutedLighter,
        color: colors.mutedDarker,
        ':hover': {
            background: colors.mutedLight,
            color: colors.mutedDark
        }
    },

    highlight: {
        background: colors.active,
        color: colors.activeLight,
        ':hover': {
            background: colors.activeDark,
            color: colors.activeLighter
        }
    },

    disabled: {
        cursor: 'not-allowed',
    }
});
