from abc import (
    ABCMeta,
    abstractmethod,
)

from cabi_visualizer.lib.scraper import (
    CaBiScraper,
)


class Locations(object):
    """Extend this abstract class for any implementation of start to end
    locations that you wish to generate a visualization for."""
    __metaclass__ = ABCMeta

    @abstractmethod
    def get_locations(self):
        """Returns a list of format:
        [
            ('start_location', 'end_location'),
            ...
        ]
        """
        pass


class CaBiLocations(Locations):

    def __init__(self, username, password):
        self.scraper = CaBiScraper(username, password)

    @staticmethod
    def _map_station_names_to_lat_lngs(station_data):
        station_lat_lngs = {
            st['name'].strip(): (
                '{}, {}'.format(st['lat'], st['lon'])
            ) for st in station_data
        }
        return station_lat_lngs

    def get_locations(self):
        trips = self.scraper.get_all_trips_data()

        # Get station metadata for lat/lng lookups from station name
        station_info = self.scraper.get_station_info()
        station_lat_lngs = self._map_station_names_to_lat_lngs(station_info)

        locations = [
            (
                station_lat_lngs[trip['start_station']],
                station_lat_lngs[trip['end_station']],
            ) for trip in trips
        ]

        return locations
