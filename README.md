# cabi-visualizer

Visualizer for trips taken by an individual Capital Bikeshare member.

### How it works

Upon providing your CaBi login details, the application logs in to CaBi and scrapes your entire trip history. Unfortunately, CaBi does not expose an API for member data. The application then queries the general CaBi API endpoint to obtain station metadata which is used to map start and end locations of trips to latitude and longitude values for the map.

Trip data is then aggregated to obtain all unique trips (as identified by the start and end points), while counting the frequency of each trip. To represent the "heat" on the map, each trip's frequency is then rescaled to a value between 0 and 1 with a Min-Max normalization.

Since CaBi does not provide any intermediate trip data, a best guess estimate of the routing for each unique trip is obtained using the Google Directions API under "bicycling" mode. Consequently, the mapped trips might not reflect the actual route taken. The polylines provided for each routing are then displayed on the heat map visualization.

## Running

### Prepare static assets

```
npm install
npm run dev
```

### Prepare application

```
cp config.example.py config.py
```

Edit config.py and replace `YOUR_API_KEY_HERE` with your Google API Key that has the [Directions](https://developers.google.com/maps/documentation/directions/) and [Maps JavaScript](https://developers.google.com/maps/documentation/javascript/) APIs enabled.

```
virtualenv venv -p python3
./venv/bin/pip install -r requirements.txt
./venv/bin/python setup.py develop
```

### Launch

```
./venv/bin/python run.py
```
