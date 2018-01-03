import { StyleSheet, css } from 'aphrodite';
import axios from 'axios';
import React from 'react';

import 'normalize.css/normalize.css';

import HeatMapScaleBar from './HeatMapScaleBar';
import PolylineHeatMap from './PolylineHeatMap';
import LoginForm from './LoginForm';
import Spinner from './Spinner';
import SvgRadioInput from './SvgRadioInput';

import ChartSvg from '../img/chart.svg';
import TimelapseSvg from '../img/timelapse.svg';
import TimerSvg from '../img/timer.svg';

import { colors } from './styles/variables';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            routes: [],
            statisticType: 'frequency'
        };

        axios.get('/api/maps/api-key').then(response => {
            this.setState({googleMapsApiKey: response.data.data.maps_api_key});
        }).catch(error => {
            this.setState({loadingStatus: 'Uh oh, something went wrong'});
            console.error(error);
        });

        this.handleLoginFormInputChange = this.handleLoginFormInputChange.bind(this);
        this.handleLoginFormSubmit = this.handleLoginFormSubmit.bind(this);
        this.handleStatisticTypeChange = this.handleStatisticTypeChange.bind(this);
    }

    handleLoginFormInputChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleLoginFormSubmit(e) {
        this.setState({
            isLoadingData: true,
            hasError: false,
            loadingStatus: 'Scraping and analyzing your Capital Bikeshare trip data'
        });
        axios.post('/api/routes/stats', {
            username: this.state.username,
            password: this.state.password,
        }).catch((error) => {
            if (error.response && error.response.status == 401) {
                this.setState({
                    isLoadingData: false,
                    hasError: true,
                    loadingStatus: 'Capital Bikeshare authentication failed, check your login details'
                });
                return Promise.reject(Error('auth'));
            }
            return Promise.reject(error);
        }).then((response) => {
            const routes = response.data.data.route_stats;
            this.uniqueRoutes = routes.length;
            this.setState({loadingStatus: `Fetching polylines (0 of ${this.uniqueRoutes})`});
            return Promise.all(routes.map((route) => (
                axios.post('/api/maps/polyline', {
                    start: `${route.waypoints[0].latitude}, ${route.waypoints[0].longitude}`,
                    end: `${route.waypoints[route.waypoints.length - 1].latitude}, ${route.waypoints[route.waypoints.length - 1].longitude}`,
                    mode: route.mode
                }).then((response) => {
                    this.setState(prevState => ({
                        routes: [...prevState.routes, {...route, path: response.data.data.polyline}]
                    }));
                    this.setState({loadingStatus: `Fetching polylines (${this.state.routes.length} of ${this.uniqueRoutes})`});
                })
            )));
        }).then(() => {
            this.setState(prevState => ({
                ...this.getStatistics(prevState.statisticType),
                isLoadingData: false,
                loadedSuccessfully: true
            }));
        }).catch((error) => {
            if (error.message !== 'auth') {
                this.setState({
                    isLoadingData: false,
                    hasError: true,
                    loadingStatus: 'Uh oh, something went wrong'
                });
                console.error(error);
            }
        });

        e.preventDefault();
    }

    getStatistics(statisticType) {
        const lowerBoundRoute = this.state.routes.find(
            route => route.statistics[statisticType].normalized_value === 0
        );
        const upperBoundRoute = this.state.routes.find(
            route => route.statistics[statisticType].normalized_value === 1
        );

        return {
            statisticLowerBound: lowerBoundRoute.statistics[statisticType].formatted_value,
            statisticUpperBound: upperBoundRoute.statistics[statisticType].formatted_value
        };
    }

    handleStatisticTypeChange(e) {
        const statisticType = e.target.value;
        this.setState({
            ...this.getStatistics(statisticType),
            statisticType: statisticType
        });
    }

    render() {
        const showLogin = !this.state.isLoadingData && !this.state.loadedSuccessfully,
            showLoadingStatus = this.state.isLoadingData,
            showStatistics = this.state.loadedSuccessfully;

        return (
            <div className={css(styles.sansFont)}>
                {this.state.googleMapsApiKey && <PolylineHeatMap apiKey={this.state.googleMapsApiKey} polylines={this.state.routes} weightKey={this.state.statisticType} />}
                <div className={css(
                    styles.materialCard,
                    styles.animate,
                    styles.loginFlow,
                    this.state.hasError && styles.loginWithErrorMessage,
                    (showLoadingStatus || showStatistics) && styles.loadingFlow,
                    showStatistics && styles.statisticsFlow
                )}>
                    {showLogin && (
                        <div>
                            <h1 className={css(styles.header)}>
                                 Log in using your Capital Bikeshare account
                            </h1>
                            <LoginForm
                                defaultUsername={this.state.username}
                                defaultPassword={this.state.password}
                                handleInputChange={this.handleLoginFormInputChange}
                                handleLoginFormSubmit={this.handleLoginFormSubmit}
                                isLoading={this.state.isLoadingData}
                                submitText="Visualize Trips" />
                            {this.state.hasError && (
                                <p className={css(styles.errorMessage)}>{this.state.loadingStatus}</p>
                            )}
                        </div>
                    )}
                    {showLoadingStatus && (
                        <div className={css(styles.flexCenter)}>
                            <Spinner />
                            <span className={css(styles.loadingText)}>{this.state.loadingStatus}</span>
                        </div>
                    )}
                    {showStatistics && (
                        <div className={css(styles.flexCol)}>
                            <SvgRadioInput
                                name="statisticType"
                                label="Trip Frequency"
                                value="frequency"
                                checked={this.state.statisticType === 'frequency'}
                                onChange={this.handleStatisticTypeChange}
                            >
                                <ChartSvg />
                            </SvgRadioInput>
                            <SvgRadioInput
                                name="statisticType"
                                label="Average Time Traveled"
                                value="average_duration"
                                checked={this.state.statisticType === 'average_duration'}
                                onChange={this.handleStatisticTypeChange}
                            >
                                <TimerSvg />
                            </SvgRadioInput>
                            <SvgRadioInput
                                name="statisticType"
                                label="Total Time Traveled"
                                value="total_duration"
                                checked={this.state.statisticType === 'total_duration'}
                                onChange={this.handleStatisticTypeChange}
                            >
                                <TimelapseSvg />
                            </SvgRadioInput>

                            <HeatMapScaleBar key="1"
                                lowerBound={this.state.statisticLowerBound}
                                upperBound={this.state.statisticUpperBound}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    sansFont: {
        fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
    },

    header: {
        fontSize: '12px',
        fontWeight: '500',
        color: colors.heavy,
        marginTop: '0',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },

    flexCenter: {
        display: 'flex',
        justifyContent: 'center'
    },

    loadingText: {
        color: colors.heavy,
        fontSize: '12px',
        paddingLeft: '5px'
    },

    errorMessage: {
        color: colors.pureRed,
        fontSize: '12px',
        margin: '0'
    },

    materialCard: {
        position: 'fixed',
        padding: '20px',
        border: `1px solid ${colors.muted}`,
        boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        overflow: 'hidden',
        backgroundColor: colors.white
    },

    animate: {
        transition: 'bottom 1s, left 1s, width 1s, height 1s, transform 1s',
    },

    loginFlow: {
        width: '350px',
        height: '225px',

        bottom: '50%',
        left: '50%',
        transform: 'translate(-50%, 50%)'
    },

    loginWithErrorMessage: {
        height: '250px'
    },

    loadingFlow: {
        width: '350px',
        height: '15px',

        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)'
    },

    statisticsFlow: {
        width: '350px',
        height: '90px',

        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)'
    },

    flexCol: {
        display: 'flex',
        flexDirection: 'column'
    }
});
