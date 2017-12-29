from abc import (
    ABCMeta,
    abstractmethod,
)
from collections import Counter

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
    def __init__(self, waypoints, duration, mode):
        self.waypoints = waypoints
        self.duration = duration
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
            'duration': self.duration,
            'mode': self.mode,
        }


class RouteStat(object):
    def __init__(self, waypoints, total_frequency, normalized_frequency):
        self.waypoints = waypoints
        self.total_frequency = total_frequency
        self.normalized_frequency = normalized_frequency

    def __json__(self):
        return {
            'waypoints': [waypoint.__json__() for waypoint in self.waypoints],
            'total_frequency': self.total_frequency,
            'normalized_frequency': self.normalized_frequency,
            # 'total_duration': TODO,
            # 'normalized_total_duration': TODO,
            # 'average_duration': TODO,
            # 'normalized_average_duration': TODO,
        }


class Routes(object):
    __metaclass__ = ABCMeta

    def get_route_stats(self):
        routes = self.get_routes()

        frequencies = Counter(routes)

        max_ = max(frequencies.values())
        normalized_frequencies = {
            route: normalize_value(frequency, 0, max_)
            for route, frequency in frequencies.items()
        }

        return [
            RouteStat(
                waypoints=route.waypoints,
                total_frequency=frequency,
                normalized_frequency=normalized_frequencies[route],
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
                duration=trip['duration'],
                mode='bicycling',
            ) for trip in trips
        ]
