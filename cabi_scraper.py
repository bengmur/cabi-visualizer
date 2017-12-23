from datetime import (
    datetime,
    timedelta,
)
from urllib import urlencode
from urllib2 import HTTPError

from bs4 import BeautifulSoup
from dateutil.parser import parse
import mechanize


class CaBiUser(object):

    def __init__(self, username, password):
        self.username = username
        self.password = password

        self.trips_link = None  # qualified with member ID
        self.membership_start_date = None
        self.trips_data = None


class CaBiScraper(object):

    def __init__(self, username, password):
        self.cabi_user = CaBiUser(username, password)

        self.browser = mechanize.Browser()
        self.browser.set_handle_robots(False)

    def _handle_http_error(self, e):
        print "%d: %s" % (e.code, e.msg)
        return False

    def authenticate(self):
        try:
            self.browser.open(
                'https://secure.capitalbikeshare.com/profile/login'
            )
        except HTTPError as e:
            return self._handle_http_error(e)

        try:
            self.browser.select_form(action=lambda url: 'login' in url)
        except mechanize._mechanize.FormNotFoundError:
            print 'Form not found'
            return False

        self.browser.form['_username'] = self.cabi_user.username
        self.browser.form['_password'] = self.cabi_user.password

        try:
            self.browser.submit()
        except HTTPError as e:
            return self._handle_http_error(e)

        if 'login' in self.browser.response().geturl():
            return False

        return True

    def init_user_data(self):
        try:
            trips_link = self.browser.find_link(url_regex='/trips/')
        except mechanize._mechanize.LinkNotFoundError:
            print 'Member ID qualified link not found'
            return False
        self.cabi_user.trips_link = trips_link.absolute_url

        soup = BeautifulSoup(self.browser.response(), 'html5lib')
        start_date = str(
            soup.find(class_='ed-panel__info__value_member-since').string
        )
        self.cabi_user.membership_start_date = parse(start_date)

    def get_trips_data(self, start, end):
        date_format = '%m/%d/%Y'

        data_query = {
            'edTripsPrint[startDate]': start.strftime(date_format),
            'edTripsPrint[endDate]': end.strftime(date_format),
        }
        data_url = (
            self.cabi_user.trips_link + '/print?' + urlencode(data_query)
        )
        try:
            self.browser.open(data_url)
        except HTTPError as e:
            return self._handle_http_error(e)

        soup = BeautifulSoup(self.browser.response(), 'html5lib')
        raw_trips = soup.find_all(class_='ed-table__item_trip')

        dom_class_translation = {
            'ed-table__item__info_trip-start-date': 'start_date',
            'ed-table__item__info_trip-end-date': 'end_date',
            'ed-table__item__info_trip-start-station': 'start_station',
            'ed-table__item__info_trip-end-station': 'end_station',
            'ed-table__item__info_trip-duration': 'duration',
        }

        trips = []
        for raw_trip in raw_trips:
            trip = {}
            for class_, prop_key in dom_class_translation.iteritems():
                prop_data = raw_trip.find(class_=class_)
                prop_data = prop_data.find(text=True, recursive=False)
                prop_data = str(prop_data).strip()
                trip[prop_key] = prop_data
            trips.append(trip)

        return trips

    def get_all_trips_data(self):
        one_year = timedelta(days=365)  # Inexact, but sufficient for our usage
        date_cursor = self.cabi_user.membership_start_date
        date_ranges = []
        while date_cursor < datetime.now():
            end_date = date_cursor + one_year
            date_ranges.append((date_cursor, end_date))
            date_cursor = end_date

        trips = []
        for start, end in date_ranges:
            trips.extend(self.get_trips_data(start, end))

        return trips
