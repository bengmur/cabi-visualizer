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
from cabi_visualizer.lib.stats import (
    determine_frequencies,
    normalize_value,
)

views = Blueprint('views', __name__)


def _require_request_params(request_data, params):
    for param in params:
        if param not in request_data:
            abort(400)


@views.route('/')
def index():
    return render_template("index.html")


@views.route('/api/locations', methods=['POST'])
def locations():
    request_data = request.get_json(force=True)
    _require_request_params(request_data, ['username', 'password'])

    # Retrieve locations for visualization
    cabi_locations = CaBiLocations(
        request_data['username'],
        request_data['password'],
    )
    try:
        locations = cabi_locations.get_locations()
    except LoginException:
        abort(400)
    except ScraperException:
        abort(502)

    return jsonify({
        'data': {
            'location_pairs': locations,
        },
    })


@views.route('/api/calculate-normalized-frequencies', methods=['POST'])
def calculate_normalized_frequencies():
    request_data = request.get_json(force=True)
    _require_request_params(request_data, ['elements'])

    elements = request_data['elements']
    if not elements:
        return jsonify({
            'data': {
                'normalized_frequencies': [],
            },
        })

    frequencies = determine_frequencies(elements)

    # Normalize with respect to a 0 frequency
    max_ = max(frequencies.values())
    normalized_frequencies = {
        key: normalize_value(val, 0, max_)
        for key, val in frequencies.iteritems()
    }

    return jsonify({
        'data': {
            'normalized_frequencies': [
                {'element': key, 'frequency': val}
                for key, val in normalized_frequencies.iteritems()
            ]
        },
    })


@views.route('/api/routing-polyline', methods=['POST'])
def routing_polyline():
    request_data = request.get_json(force=True)
    _require_request_params(request_data, ['start', 'end'])

    gmap = GoogleMap(current_app.config['GOOGLE_API_KEY'])
    polyline = gmap.get_polyline_between_places(
        request_data['start'],
        request_data['end'],
        request_data.get('mode'),
    )

    return jsonify({
        'data': {
            'polyline': polyline,
        },
    })
