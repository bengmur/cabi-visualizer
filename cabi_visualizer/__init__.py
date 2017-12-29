from flask import (
    Flask,
    render_template,
)

from cabi_visualizer.maps.views import maps_views
from cabi_visualizer.routes.views import routes_views

app = Flask(
    __name__,
    static_folder="../static/dist",
    template_folder="../static",
)

app.config.from_object('config')

app.register_blueprint(maps_views, url_prefix='/api/maps')
app.register_blueprint(routes_views, url_prefix='/api/routes')


@app.route('/')
def index():
    return render_template("index.html")
