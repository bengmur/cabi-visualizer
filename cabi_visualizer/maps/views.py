from flask import (
    Blueprint,
    current_app,
    jsonify,
    request,
)
import googlemaps

from cabi_visualizer.lib.utils import require_request_params

maps_views = Blueprint('maps', __name__)


@maps_views.route('/polyline', methods=['POST'])
def maps_polyline():
    request_data = request.get_json(force=True)
    require_request_params(request_data, ['start', 'end'])

    client = googlemaps.Client(
        key=current_app.config['GOOGLE_API_KEY'],
    )
    directions = client.directions(
        request_data['start'],
        request_data['end'],
        mode=request_data.get('mode'),
    )

    return jsonify({
        'data': {
            'polyline': directions[0]['overview_polyline']['points'],
        },
    })


@maps_views.route('/api-key', methods=['GET'])
def maps_api_key():
    return jsonify({
        'data': {
            'maps_api_key': current_app.config['GOOGLE_API_KEY'],
        }
    })
