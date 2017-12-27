# cabi-visualizer

Visualizer for trips taken by an individual Capital Bikeshare member.

## Running

### Prepare Static Assets

```
npm install
npm run dev
```

### Prepare Application

```
cp config.example.py config.py
```

Edit config.py and replace `YOUR_API_KEY_HERE` with your Google API Key that has the [Directions](https://developers.google.com/maps/documentation/directions/) and [Maps JavaScript](https://developers.google.com/maps/documentation/javascript/) APIs enabled.

```
virtualenv venv -p python2.7
./venv/bin/pip install -r requirements.txt
./venv/bin/python setup.py develop
```

### Launch

```
./venv/bin/python run.py
```
