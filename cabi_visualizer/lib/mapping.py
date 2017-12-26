import googlemaps


class GoogleMap(object):
    def __init__(self, api_key):
        self.gmaps = googlemaps.Client(
            key=api_key,
        )

    def get_polyline_between_places(self, start, end, mode=None):
        directions_result = self.gmaps.directions(
            start,
            end,
            mode=mode,
        )
        return directions_result[0]['overview_polyline']['points']
