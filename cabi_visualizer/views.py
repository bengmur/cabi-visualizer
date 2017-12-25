from flask import (
    abort,
    Blueprint,
    current_app,
    jsonify,
    render_template,
    request,
)

from cabi_visualizer.lib.mapping import GoogleMap
from cabi_visualizer.lib.locations import CaBiLocations
from cabi_visualizer.lib.scraper import (
    LoginException,
    ScraperException,
)

views = Blueprint('views', __name__)


@views.route('/')
def index():
    return render_template("index.html")


@views.route('/api/locations', methods=['POST'])
def locations():
    login_data = request.get_json(force=True)
    if 'username' not in login_data or 'password' not in login_data:
        abort(400)

    # Retrieve locations for visualization
    cabi_locations = CaBiLocations(
        # Request raises HTTP 400 if login data not present
        login_data['username'],
        login_data['password'],
    )
    try:
        locations = cabi_locations.get_locations()
    except LoginException:
        abort(400)
    except ScraperException:
        abort(502)

    locations = CaBiLocations.determine_location_frequencies(locations)

    gmap = GoogleMap(current_app.config['GOOGLE_API_KEY'])
    for location in locations:
        gmap.add_polyline_between_places(location[0], location[1], 'bicycling')

    return jsonify(gmap.polylines)
