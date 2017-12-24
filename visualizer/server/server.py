from flask import (
    abort,
    Flask,
    jsonify,
    request,
)

from visualizer.server.lib.locations import CaBiLocations
from visualizer.server.lib.scraper import (
    LoginException,
    ScraperException,
)

app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello world'


@app.route('/api/locations', methods=['POST'])
def locations():
    # Retrieve locations for visualization
    model = CaBiLocations(
        # Request raises HTTP 400 if login data not present
        request.form['username'],
        request.form['password'],
    )
    try:
        locations = model.get_locations()
    except LoginException:
        abort(400)
    except ScraperException:
        abort(502)

    # TODO: This will eventually respond with data ready for the frontend map
    return jsonify(locations)
