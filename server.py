from flask import (
   Flask,
   jsonify,
   request,   # flask: read request from frond-end
   send_from_directory
)
from icalendar import Calendar
from datetime import datetime
import requests
from urllib.parse import urlsplit

app = Flask(__name__, static_folder=".", static_url_path="")    # create flask instance

@app.get("/")    # when browser sends a 'GET' request to the website's root URL, run this function
def index():
    return send_from_directory(
    app.root_path,
     "html/calendarInfoInput.html")


@app.get("/<filename>")
def page_asset(filename):
    allowed = {
        "html/calendarInfoInput.html"
        "js/calendarInfoInput.js",
        "html/dashboard.html", "js/plannerScript.js", "planner.css",
    }
    if filename not in allowed:
        return jsonify({"error": "Not found"}), 404
    return send_from_directory(app.root_path, filename)


@app.get("/fetchIcsUrl.js")
def javascript():
    return send_from_directory(app.root_path, "fetchIcsUrl.js")


@app.post("/api/calendar")    # receive request from frontend(fetch("/api/calendar")...)
def calendar():
    data = request.get_json(silent=True)    # read json requests

    # url validation
    if isinstance(data, dict):
        url = data.get("url")
    else:
        url = None

    if not isinstance(url, str):
        return jsonify({"error": "Please provide a calendar URL."}), 400
    url = url.strip()

    if not url:
        return jsonify({"error": "Calendar URL cannot be empty."})

    # validate url format
    parsed_url = urlsplit(url)
    if parsed_url.scheme not in ("http", "https") or not parsed_url.hostname:
        return jsonify({
            "error": "Please provide a valid HTTP or HTTPS url"
        }), 400

    # 1. get ICS
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
    except requests.RequestException:
        return jsonify({
            "error": "Could not retrieve the calendar. Check the URL and try again."
        }), 502

    # 2. analyze ICS
    try:
        cal = Calendar.from_ical(response.content)    # convert original content to ics object
        events = []

        # analyze ics content based on a example from a ics file
        for component in cal.walk("VEVENT"):
            # mark start and end in each component(event)
            start = component.decoded("DTSTART", None)
            end = component.decoded("DTEND", None)

            # turn ics format into json format
            event = {
                "id": str(component.get("UID", "")),
                "title": str(component.get("SUMMARY", "")),
                "description": str(component.get("DESCRIPTION", "")),
                "location": str(component.get("LOCATION", "")),
                "start": start.isoformat() if start is not None else None,
                "end": end.isoformat() if end is not None else None,
                "allDay": (
                    start is not None
                    and not isinstance(start, datetime)
                )
            }

            events.append(event)

    # handle exception
    except Exception:
        return jsonify({"error": "The URL did not return a valid ICS calendar. Please try another URL."}), 422

    if not events:
        return jsonify({"error": "No events found. Please provide another calendar URL."}), 422

    # 3. turn ics into json
    return jsonify(events)


if __name__ == "__main__":
    app.run(port=5000)