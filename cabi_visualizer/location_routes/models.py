from abc import (
    ABCMeta,
    abstractmethod,
)
from collections import Counter, defaultdict

from cabi_visualizer.lib.scraper import CaBiScraper
from cabi_visualizer.lib.format import (
    format_duration,
    pluralize,
)


class Waypoint(object):
    def __init__(self, name, latitude, longitude):
        self.name = name
        self.latitude = latitude
        self.longitude = longitude

    def __eq__(self, other):
        equality_checks = (
            self.name == other.name,
            self.latitude == other.latitude,
            self.longitude == other.longitude,
        )
        return all(equality_checks)

    def __hash__(self):
        return hash((
            self.name,
            self.latitude,
            self.longitude,
        ))

    def __json__(self):
        return {
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
        }


class Route(object):
    """A route consists of a list of waypoints which comprise its path,
    a duration of travel time, and a mode of travel.
    """
    def __init__(self, waypoints, mode, duration_seconds):
        self.waypoints = waypoints
        self.mode = mode
        self.duration_seconds = duration_seconds

    def __eq__(self, other):
        """Routes are considered equal if they have the same waypoints in the
        same order and are of the same mode. Actual duration may vary.
        """
        equality_checks = (
            self.waypoints == other.waypoints,
            self.mode == other.mode,
        )
        return all(equality_checks)

    def __hash__(self):
        return hash((
            self.waypoints,
            self.mode,
        ))

    def __json__(self):
        return {
            'waypoints': [waypoint.__json__() for waypoint in self.waypoints],
            'mode': self.mode,
            'duration_seconds': self.duration_seconds,
        }


class Statistic(object):
    def __init__(self, name, formatted_value, raw_value, normalized_value):
        self.name = name
        self.formatted_value = formatted_value
        self.raw_value = raw_value
        self.normalized_value = normalized_value

    @staticmethod
    def normalize_value(val, min_, max_):
        normalized = (val - min_) / (max_ - min_)
        return normalized

    @staticmethod
    def normalize_values_map(values_map):
        min_value = min(values_map.values())
        max_value = max(values_map.values())
        return {
            key: Statistic.normalize_value(value, min_value, max_value)
            for key, value in values_map.items()
        }


class RouteStatistic(object):
    def __init__(self, waypoints, mode, statistics):

        self.waypoints = waypoints
        self.mode = mode
        self.statistics = statistics

    def __json__(self):
        return {
            'waypoints': [waypoint.__json__() for waypoint in self.waypoints],
            'mode': self.mode,
            'statistics':  {
                statistic.name: {
                    'formatted_value': statistic.formatted_value,
                    'raw_value': statistic.raw_value,
                    'normalized_value': statistic.normalized_value,
                } for statistic in self.statistics
            }
        }


class Routes(object):
    __metaclass__ = ABCMeta

    def get_route_stats(self):
        routes = self.get_routes()

        # Frequency
        frequencies = Counter(routes)

        formatted_frequencies = {
            route: pluralize(
                value, 'trip'
            ) for route, value in frequencies.items()
        }

        normalized_frequencies = Statistic.normalize_values_map(frequencies)

        # Total duration
        total_durations = defaultdict(int)
        for route in routes:
            total_durations[route] += route.duration_seconds

        formatted_total_durations = {
            route: format_duration(
                value
            ) for route, value in total_durations.items()
        }

        normalized_total_durations = Statistic.normalize_values_map(
            total_durations)

        # Average duration
        avg_durations = {
            route: total_durations[route] / frequencies[route]
            for route in total_durations.keys()
        }

        formatted_avg_durations = {
            route: format_duration(
                round(value)
            ) for route, value in avg_durations.items()
        }

        normalized_avg_durations = Statistic.normalize_values_map(
            avg_durations)

        return [
            RouteStatistic(
                waypoints=route.waypoints,
                mode=route.mode,
                statistics=[
                    Statistic(
                        name='frequency',
                        formatted_value=formatted_frequencies[route],
                        raw_value=frequencies[route],
                        normalized_value=normalized_frequencies[route],
                    ),
                    Statistic(
                        name='total_duration',
                        formatted_value=formatted_total_durations[route],
                        raw_value=total_durations[route],
                        normalized_value=normalized_total_durations[route],
                    ),
                    Statistic(
                        name='average_duration',
                        formatted_value=formatted_avg_durations[route],
                        raw_value=avg_durations[route],
                        normalized_value=normalized_avg_durations[route],
                    ),
                ]
            ) for route, frequency in frequencies.items()
        ]

    @abstractmethod
    def get_routes(self):
        """Returns a list of routes.
        """
        pass


class CaBiRoutes(Routes):

    def __init__(self, username, password):
        self.scraper = CaBiScraper(username, password)

    def get_routes(self):
        trips = self.scraper.get_all_trips_data()

        # Get station metadata (for latitudes and longitudes)
        station_data = self.scraper.get_station_info()
        station_waypoints = {
            st['name'].strip(): Waypoint(
                st['name'].strip(), st['lat'], st['lon']
            ) for st in station_data
        }

        return [
            Route(
                waypoints=(
                    station_waypoints[trip['start_station']],
                    station_waypoints[trip['end_station']],
                ),
                mode='bicycling',
                duration_seconds=trip['duration_seconds'],
            ) for trip in trips
        ]
