var nrft = function(api_result) {
    "use strict";

    // Display the plug-in.
    Spice.render({
        data             : api_result,
        header1          : "Airlines",
        source_url       : "http://www.flightstats.com",
        source_name      : "FlightStats",
        template_normal  : "airlines",
        force_big_header : true
    });
};

(function() {
    "use strict";

    var MILLIS_PER_MIN = 60000;
    var MILLIS_PER_HOUR = MILLIS_PER_MIN * 60;

    // Parse string, and return the date (either arrival or departure date).
    var getDateFromString = function(date) {
        date = date.match(/([\d]{4})\-([\d]{2})\-([\d]{2})T([\d]{2}):([\d]{2}):([\d]{2})/);
        var now = new Date();
        var milliseconds = Date.UTC(date[1], date[2] - 1, date[3], date[4], date[5], date[6]) +
                                (now.getTimezoneOffset() * MILLIS_PER_MIN);
        return new Date(milliseconds);
    };

    // Compute the difference between now and the time of departure or arrival.
    var relativeTime = function(date, airportOffset) {
        // This is the time of departure or arrival (not sure why we're getting the difference).
        date = date.getTime() - (date.getTimezoneOffset() * MILLIS_PER_MIN);

        // This is the current time at the airport (in milliseconds).
        var now = new Date().getTime() + (airportOffset * MILLIS_PER_HOUR);

        return date - now;
    };

    // Convert the time from milliseconds to hours and minutes.
    var toTime = function(delta) {
        var time = "";
        var hours = Math.abs(Math.floor(delta / MILLIS_PER_HOUR));
        var minutes = Math.abs(Math.floor((delta % MILLIS_PER_HOUR) / MILLIS_PER_MIN));
        if (0 < hours) {
            time += hours + " hrs ";
        }
        if (0 < minutes) {
            time += minutes + " mins ";
        }
        return time;
    };

    // Check when the plane will depart (or if it has departed).
    Handlebars.registerHelper("status", function(actualDate, publishedDate, airportOffset, isDeparture) {
        var dateString = actualDate || publishedDate
        var dateObject = getDateFromString(dateString);

        var delta = relativeTime(dateObject, airportOffset);
        var time = toTime(delta);

        if(isDeparture) {
            if(delta === 0) {
                return "<b>Departing</b> " + time;
            } else if(delta > 0) {
                return "<b>Departs</b> " + time;
            } else {
                return "<b>Departed</b> " + time;
            }
        } else {
            if(delta === 0) {
                return "<b>Arriving</b> " + time;
            } else if(delta > 0) {
                return "<b>Arrives</b> " + time;
            } else {
                return "<b>Arrived</b> " + time;
            }
        }
    });

    Handlebars.registerHelper("airportName", function(name) {
        return name.replace(/airport|international/ig, "");
    });

    Handlebars.registerHelper("checkGate", function(gate) {
        if(gate) {
            return "Gate " + gate;
        } else {
            return "Gate unavailable";
        }
    });

    Handlebars.registerHelper("time", function(actualDate, publishedDate) {
        var dateString = actualDate || publishedDate
        var dateObject = getDateFromString(dateString);
        console.log(dateObject);

        var hours = dateObject.getHours();
        var minutes = dateObject.getMinutes();

        var date = dateObject.toDateString();
        date = date.substring(0, date.lastIndexOf(" "));

        var suffix = "";
        // AM or PM?
        if(hours >= 12) {
            suffix = "p.m.";
        } else {
            suffix = "a.m.";
        }

        // Convert to 12-hour clock.
        if(hours > 12) {
            hours -= 12;
        }

        // Add leading zeroes.
        minutes = minutes < 10 ? "0" + minutes : minutes;

        return date + ", " + hours + ":" + minutes + " " + suffix;
    });
}());