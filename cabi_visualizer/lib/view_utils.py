from flask import abort


def require_request_params(request_data, params):
    for param in params:
        if param not in request_data or not request_data[param]:
            abort(400)
