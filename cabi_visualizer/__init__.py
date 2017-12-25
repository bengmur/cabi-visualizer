from flask import Flask

from cabi_visualizer.views import views


app = Flask(
    __name__,
    static_folder="../static/dist",
    template_folder="../static",
)
app.config.from_object('config')
app.register_blueprint(views)
