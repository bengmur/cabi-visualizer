import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { colors } from './styles/variables';

export default class HeatMapScaleBar extends React.Component {
    render() {

        return (
            <div className={css(styles.wrapper)}>
                <div className={css(styles.gradient, styles.bar, styles.height)}>
                    <div className={css(styles.clearfix, styles.labels)}>
                        <span className={css(styles.height, styles.left)}>
                            {this.props.lowerBound}
                        </span>
                        <span className={css(styles.height, styles.right)}>
                            {this.props.upperBound}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {paddingBottom: '15px'},

    gradient: {
        background: `linear-gradient(to right, ${colors.pureGreen}, ${colors.pureYellow}, ${colors.pureRed})`
    },

    bar: {
        width: '100%',
        borderRadius: '2px',
        boxShadow: 'rgba(0, 0, 0, 0.13) 0px 5px 10px, rgba(0, 0, 0, 0.13) 0px 3px 3px;'
    },

    height: {
        lineHeight: '16px',
        height: '16px'
    },

    labels: {
        fontSize: '14px',
        fontWeight: '200',
        padding: '0 10px'
    },

    clearfix: {overflow: 'auto'},
    left: {float: 'left'},
    right: {float: 'right'}
});
