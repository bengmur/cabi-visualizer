from abc import (
    ABCMeta,
    abstractmethod,
)

from visualizer.server.lib.scraper import (
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

    def get_locations(self):
        scraper = CaBiScraper(self.username, self.password)
        trips = scraper.get_all_trips_data()

        locations = [
            (trip['start_station'], trip['end_station']) for trip in trips
        ]

        return locations
