import { StyleSheet, css } from 'aphrodite';
import React from 'react';

import { colors } from './styles/variables';

export default class Spinner extends React.Component {
    render() {
        return (
            <div className={css(styles.container)}>
                <div className={css(styles.loader)} />
            </div>
        );
    }
}

const loadKeyframes = {
    '0%': {},
    '80%': {},
    '100%': {
        boxShadow: '0 0',
        height: '4em'
    },
    '40%': {
        boxShadow: '0 -2em',
        height: '5em'
    }
};

const animate = {
    background: colors.muted,
    animationName: loadKeyframes,
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    width: '1em',
    height: '4em'
};

const pseudoBeforeAfter = {
    position: 'absolute',
    top: '0',
    content: '""'
};

const styles = StyleSheet.create({
    'container': {
        height: '12px',
        width: '12px'
    },

    'loader': {
        ...animate,

        fontSize: '2px',

        color: colors.muted,
        margin: '2em 2em',
        position: 'relative',
        transform: 'translateZ(0)',
        animationDelay: '-0.16s',
        ':before': {
            ...animate,
            ...pseudoBeforeAfter,

            left: '-1.5em',
            animationDelay: '-0.32s'
        },
        ':after': {
            ...animate,
            ...pseudoBeforeAfter,

            left: '1.5em'
        }
    }
});
