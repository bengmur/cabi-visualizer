from abc import (
    ABCMeta,
    abstractmethod,
)
from collections import Counter, defaultdict

from cabi_visualizer.lib.scraper import (
    CaBiScraper,
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
    def __init__(self, name, value, normalized_value):
        self.name = name
        self.value = value
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
                    'value': statistic.value,
                    'normalized_value': statistic.normalized_value,
                } for statistic in self.statistics
            }
        }


class Routes(object):
    __metaclass__ = ABCMeta

    def get_route_stats(self):
        routes = self.get_routes()

        frequencies = Counter(routes)
        normalized_frequencies = Statistic.normalize_values_map(frequencies)

        total_durations = defaultdict(int)
        for route in routes:
            total_durations[route] += route.duration_seconds
        normalized_total_durations = Statistic.normalize_values_map(
            total_durations)

        avg_durations = {
            route: total_durations[route] / frequencies[route]
            for route in total_durations.keys()
        }
        normalized_avg_durations = Statistic.normalize_values_map(
            avg_durations)

        return [
            RouteStatistic(
                waypoints=route.waypoints,
                mode=route.mode,
                statistics=[
                    Statistic(
                        'frequency',
                        frequencies[route],
                        normalized_frequencies[route],
                    ),
                    Statistic(
                        'total_duration',
                        total_durations[route],
                        normalized_total_durations[route],
                    ),
                    Statistic(
                        'average_duration',
                        avg_durations[route],
                        normalized_avg_durations[route],
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
