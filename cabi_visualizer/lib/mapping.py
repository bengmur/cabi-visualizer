import googlemaps


class GoogleMap(object):
    def __init__(self, api_key):
        self.gmaps = googlemaps.Client(
            key=api_key,
        )

        self.polylines = []

    def add_polyline_between_places(self, start, end, mode):
        directions_result = self.gmaps.directions(
            start,
            end,
            mode=mode,
        )
        self.polylines.append(
            directions_result[0]['overview_polyline']['points']
        )
