import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { colors } from './styles/variables';

export default class HeatMapScaleBar extends React.Component {
    render() {

        return (
            <div className={css(styles.wrapper)}>
                <div className={css(styles.label, styles.left, styles.height)}>
                    {this.props.lowerBound}
                </div>
                <div className={css(styles.gradient, styles.bar, styles.height)}>
                </div>
                <div className={css(styles.label, styles.right, styles.height)}>
                    {this.props.upperBound}
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
        display: 'flex',
        paddingBottom: '15px'
    },

    gradient: {
        background: `linear-gradient(to right, ${colors.pureGreen}, ${colors.pureYellow}, ${colors.pureRed})`
    },

    bar: {
        width: '30%',
        borderRadius: '2px',
        boxShadow: 'rgba(0, 0, 0, 0.13) 0px 5px 10px, rgba(0, 0, 0, 0.13) 0px 3px 3px'
    },

    height: {
        lineHeight: '16px',
        height: '16px'
    },

    label: {
        width: '35%',
        fontSize: '12px',
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: '1px',
        color: colors.heavy
    },

    left: {borderLeft: `1px solid ${colors.muted}`},
    right: {borderRight: `1px solid ${colors.muted}`}
});
