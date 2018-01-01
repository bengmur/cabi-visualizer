from datetime import (
    datetime,
    timedelta,
)
from urllib.parse import urlencode

from dateutil.parser import parse
import mechanicalsoup
import requests


class LoginException(Exception):
    pass


class ScraperException(Exception):
    pass


class CaBiUser(object):

    def __init__(self, username, password):
        self.username = username
        self.password = password

        self.trips_link = None  # qualified with member ID
        self.membership_start_date = None


class CaBiScraper(object):

    def __init__(self, username, password):
        self.cabi_user = CaBiUser(username, password)

        self.browser = mechanicalsoup.StatefulBrowser()

    def _authenticate(self):
        response = self.browser.open(
            'https://secure.capitalbikeshare.com/profile/login'
        )
        if not response.ok:
            raise ScraperException

        try:
            self.browser.select_form(selector='form[action*="login"]')
        except mechanicalsoup.LinkNotFoundError:
            # Form not found
            raise ScraperException

        self.browser['_username'] = self.cabi_user.username
        self.browser['_password'] = self.cabi_user.password

        response = self.browser.submit_selected()
        if not response.ok:
            raise ScraperException

        if 'login' in self.browser.get_url():
            raise LoginException

    def _init_user_data(self):
        try:
            trips_link = self.browser.find_link(url_regex='/trips/')
        except mechanicalsoup.LinkNotFoundError:
            # Member ID qualified link not found
            raise ScraperException
        self.cabi_user.trips_link = self.browser.absolute_url(
            trips_link['href']
        )

        page = self.browser.get_current_page()
        start_date = str(
            page.find(class_='ed-panel__info__value_member-since').string
        )
        try:
            self.cabi_user.membership_start_date = parse(start_date)
        except (ValueError, OverflowError):
            raise ScraperException

    def _get_trips_data(self, start, end):
        date_format = '%m/%d/%Y'

        data_query = {
            'edTripsPrint[startDate]': start.strftime(date_format),
            'edTripsPrint[endDate]': end.strftime(date_format),
        }
        data_url = (
            self.cabi_user.trips_link + '/print?' + urlencode(data_query)
        )

        response = self.browser.open(data_url)
        if not response.ok:
            raise ScraperException

        page = self.browser.get_current_page()
        raw_trips = page.find_all(class_='ed-table__item_trip')

        dom_class_translation = {
            'ed-table__item__info_trip-start-date': 'start_datetime',
            'ed-table__item__info_trip-end-date': 'end_datetime',
            'ed-table__item__info_trip-start-station': 'start_station',
            'ed-table__item__info_trip-end-station': 'end_station',
            'ed-table__item__info_trip-duration': 'duration_seconds',
        }

        trips = []
        for raw_trip in raw_trips:
            trip = {}
            for class_, prop_key in dom_class_translation.items():
                prop_data = raw_trip.find(class_=class_)
                prop_data = prop_data.find(text=True, recursive=False)
                prop_data = str(prop_data).strip()

                # Convert datetime into ISO 8601 format
                if 'datetime' in prop_key:
                    prop_data = parse(prop_data).isoformat()

                # Convert duration to seconds
                if 'duration' in prop_key:
                    prop_data = parse(prop_data)
                    prop_data = timedelta(
                        hours=prop_data.hour,
                        minutes=prop_data.minute,
                        seconds=prop_data.second,
                    )
                    prop_data = int(prop_data.total_seconds())

                trip[prop_key] = prop_data
            trips.append(trip)

        return trips

    def get_all_trips_data(self):
        """Capital Bikeshare provides no easy way access user data through an
        API, as they do for overall system data. To get around this, we can
        scrape it manually from the member's trip page. Considering the login
        form with CSRF protection, as well as URI route paths relying on a
        distinct member ID, the easiest way to do this is with a stateful web
        browser.

        Returns a list of format:
        [
            {
                'start_datetime': string,
                'end_datetime': string,
                'start_station': string,
                'end_station': string,
                'duration_seconds': int,
            },
            ...
        ]
        """

        self._authenticate()
        self._init_user_data()

        one_year = timedelta(days=365)  # Inexact, but sufficient for our usage
        date_cursor = self.cabi_user.membership_start_date
        date_ranges = []
        while date_cursor < datetime.now():
            end_date = date_cursor + one_year
            date_ranges.append((date_cursor, end_date))
            date_cursor = end_date

        trips = []
        for start, end in date_ranges:
            trips.extend(self._get_trips_data(start, end))

        return trips

    def get_station_info(self):
        response = requests.get(
            'https://gbfs.capitalbikeshare.com/gbfs/en/station_information.json'
        )
        station_info = response.json()['data']['stations']
        return station_info
