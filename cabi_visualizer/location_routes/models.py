from abc import (
    ABCMeta,
    abstractmethod,
)
from collections import Counter, defaultdict

from cabi_visualizer.lib.scraper import (
    CaBiScraper,
)
from cabi_visualizer.lib.stats import normalize_value


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
    def __init__(self, waypoints, duration_seconds, mode):
        self.waypoints = waypoints
        self.duration_seconds = duration_seconds
        self.mode = mode

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
            'duration_seconds': self.duration_seconds,
            'mode': self.mode,
        }


class RouteStat(object):
    def __init__(self, waypoints, total_frequency, normalized_frequency,
                 total_duration_seconds, normalized_total_duration,
                 avg_duration_seconds, normalized_avg_duration):

        self.waypoints = waypoints

        self.total_frequency = total_frequency
        self.normalized_frequency = normalized_frequency

        self.total_duration_seconds = total_duration_seconds
        self.normalized_total_duration = normalized_total_duration

        self.avg_duration_seconds = avg_duration_seconds
        self.normalized_avg_duration = normalized_avg_duration

    def __json__(self):
        return {
            'waypoints': [waypoint.__json__() for waypoint in self.waypoints],
            'total_frequency': self.total_frequency,
            'normalized_frequency': self.normalized_frequency,
            'total_duration_seconds': self.total_duration_seconds,
            'normalized_total_duration': self.normalized_total_duration,
            'avg_duration_seconds': self.avg_duration_seconds,
            'normalized_avg_duration': self.normalized_avg_duration,
        }


class Routes(object):
    __metaclass__ = ABCMeta

    def get_route_stats(self):
        routes = self.get_routes()

        frequencies = Counter(routes)

        # TODO refact, e.g. "normalize_dict_values"?
        min_frequency = min(frequencies.values())
        max_frequency = max(frequencies.values())
        normalized_frequencies = {
            route: normalize_value(frequency, min_frequency, max_frequency)
            for route, frequency in frequencies.items()
        }

        total_durations = defaultdict(int)
        for route in routes:
            total_durations[route] += route.duration_seconds

        min_duration = min(total_durations.values())
        max_duration = max(total_durations.values())
        normalized_total_durations = {
            route: normalize_value(duration, min_duration, max_duration)
            for route, duration in total_durations.items()
        }

        avg_durations = {
            route: total_durations[route] / frequencies[route]
            for route in frequencies.keys()
        }

        min_avg_duration = min(avg_durations.values())
        max_avg_duration = max(avg_durations.values())
        normalized_avg_durations = {
            route: normalize_value(avg_duration, min_avg_duration,
                                   max_avg_duration)
            for route, avg_duration in avg_durations.items()
        }

        return [
            RouteStat(
                waypoints=route.waypoints,
                total_frequency=frequency,
                normalized_frequency=normalized_frequencies[route],
                total_duration_seconds=total_durations[route],
                normalized_total_duration=normalized_total_durations[route],
                avg_duration_seconds=avg_durations[route],
                normalized_avg_duration=normalized_avg_durations[route],
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
                duration_seconds=trip['duration_seconds'],
                mode='bicycling',
            ) for trip in trips
        ]
