from flask import (
    abort,
    Blueprint,
    jsonify,
    request,
)

from cabi_visualizer.lib.scraper import (
    LoginException,
    ScraperException,
)
from cabi_visualizer.lib.view_utils import require_request_params
from cabi_visualizer.location_routes.models import CaBiRoutes

location_routes_views = Blueprint('location_routes_views', __name__)


@location_routes_views.route('/all', methods=['POST'])
def routes_all():
    request_data = request.get_json(force=True)
    require_request_params(request_data, ['username', 'password'])

    cabi_routes = CaBiRoutes(
        request_data['username'],
        request_data['password'],
    )
    try:
        routes = cabi_routes.get_routes()
    except LoginException:
        abort(401)
    except ScraperException:
        abort(502)

    return jsonify({
        'data': {
            'routes': [route.__json__() for route in routes],
        },
    })


@location_routes_views.route('/stats', methods=['POST'])
def routes_stats():
    request_data = request.get_json(force=True)
    require_request_params(request_data, ['username', 'password'])

    cabi_routes = CaBiRoutes(
        request_data['username'],
        request_data['password'],
    )
    try:
        route_stats = cabi_routes.get_route_stats()
    except LoginException:
        abort(401)
    except ScraperException:
        abort(502)

    return jsonify({
        'data': {
            'route_stats': [route.__json__() for route in route_stats],
        },
    })
