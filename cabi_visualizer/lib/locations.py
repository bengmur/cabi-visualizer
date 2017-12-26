from abc import (
    ABCMeta,
    abstractmethod,
)

import requests

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
        self.username = username
        self.password = password

        # Get station metadata for lat/lng lookups from station name
        response = requests.get('https://gbfs.capitalbikeshare.com/gbfs/en/station_information.json')
        station_data = response.json()['data']['stations']
        self.station_latlngs = {
            st['name'].strip(): (
                '{}, {}'.format(st['lat'], st['lon'])
            ) for st in station_data
        }

    def get_locations(self):
        scraper = CaBiScraper(self.username, self.password)
        trips = scraper.get_all_trips_data()

        locations = [
            (
                self.station_latlngs[trip['start_station']],
                self.station_latlngs[trip['end_station']],
            ) for trip in trips
        ]

        return locations
