import React from 'react';

export default class HeatMapScaleBar extends React.Component {
    render() {
        const barHeight = '25px';
        return (
            <div style={{paddingBottom: '15px'}}>
                <div style={{
                    height: barHeight,
                    width: '100%',
                    background: 'linear-gradient(to right, rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))',
                    borderRadius: '2px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
                }}>
                    <div style={{overflow: 'auto', padding: '0 10px 0 10px'}}>
                        <span style={{float: 'left', lineHeight: barHeight}}>
                            {this.props.lowerBound}
                        </span>
                        <span style={{float: 'right', lineHeight: barHeight}}>
                            {this.props.upperBound}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}
