function convertFCEvent(e){

    if (e.VCALENDAR.hasOwnProperty("VTIMEZONE")) {
        var hours_offset = parseInt(e.VCALENDAR.VTIMEZONE.TZOFFSETTO.substring(0, 3));
        var minutes_offset = parseInt(e.VCALENDAR.VTIMEZONE.TZOFFSETTO.substring(3, 5));
        if (hours_offset >= 0) {
            minutes_offset = -minutes_offset;
        }
    } else {
        var hours_offset = 0;
        var minutes_offset = 0;
    }
    if (e.VCALENDAR.hasOwnProperty("VEVENT")) {
        var FCevent = {};
        for (prop in e.VCALENDAR.VEVENT) {

            if (prop.startsWith("DTSTART")) {
                var startDate = parseDate(prop ,e.VCALENDAR.VEVENT[prop]);
                var tz = tzidPattern.exec(prop);
                if (tz){
                    startDate.setUTCHours(startDate.getUTCHours() - hours_offset);
                    startDate.setUTCMinutes(startDate.getUTCMinutes() - minutes_offset);
                }

                FCevent["start"] = startDate.toISOTZString();
                if (prop.endsWith("VALUE=DATE")) {
                    FCevent["allDay"] = true;
                }

            } else if (prop.startsWith("DTEND")) {
                var stopDate = parseDate(prop, e.VCALENDAR.VEVENT[prop]);
                var tz = tzidPattern.exec(prop);
                if (tz){
                    stopDate.setUTCHours(stopDate.getUTCHours() - hours_offset);
                    stopDate.setUTCMinutes(stopDate.getUTCMinutes() - minutes_offset);
                }
                FCevent["end"] = stopDate.toISOTZString();

            } else if (prop.startsWith("SUMMARY")) {
                FCevent["title"] = e.VCALENDAR.VEVENT[prop];

            } else if (prop.startsWith("UID")) {
                FCevent["id"] = e.VCALENDAR.VEVENT[prop];
            }
        }
        //FCevent["textColor"] = "red";
        //FCevent["backgroundColor"] = "green";
        //FCevent["borderColor"] = "yellow";
        return FCevent;
    }
    return null;
}


function parseICS(parent_object, data, idx){

    while (idx < data.length) {

        if (data[idx]) {

            var line = data[idx].partition(":");
            var attr_name = line[0];
            var attr_value = line[1];

            if (line[0] == "BEGIN"){
                var e = new Object();
                idx = parseICS(e, data, idx + 1);
                parent_object[attr_value.trim()] = e;
            } else if  (attr_name == "END") {
                return idx + 1;
            } else {
                parent_object[attr_name] = attr_value.trim();
            }
        }
        idx += 1;
    }
}

function loadEvents(calendar){
    var events = new Object();
    var FCevents = [];
    var urls = calendar.urls;
    for (e_idx in urls){
        console.log("Téléchargement de " + urls[e_idx]);
        $.get(urls[e_idx], success= function (data, textStatus, jqXhr) {
            var e = new Object();
            parseICS(e, data.split("\n"), 0);
            var uid = data.match(/UID:(.*)/)[1];
            events[uid] = e
            FCe = convertFCEvent(e);
            if (FCe)
                FCevents.push(FCe);
            ICSloaded += 1;
        });
    }
    calendar["events"] = events;
    calendar["FCevents"] = FCevents;
}

Calendars = new Object();
ICScpt = 0;
ICScpt_last = 0;
ICSloaded = 0;

function loadcalendars(cl){
    for (i in cl) {
        console.log("Chargement de " + cl[i]);
        getCalendarData(cl[i], function (r) {
            URLs = [];
            displayname = $(r.responseXML).find('displayname').text();
            $(r.responseXML).find('href').each(function(index, element){
                el = $(element).text();
                if (el.endsWith(".ics")) {
                    URLs.push(el);
                    ICScpt++;

                }

            });
            //loadcalendars(calendarList);
            Calendars[displayname] = new Object();
            Calendars[displayname]["href"] = cl[i];
            Calendars[displayname]["urls"] = URLs;
            loadEvents(Calendars[displayname]);
            console.log(Calendars[displayname]);
        });
    }
}


function writeICS(el){

    var result = "";

    for(var propertyName in el) {

        if (propertyName) {
            var attr_name = propertyName;
            var attr_value = el[attr_name];

            if (typeof(attr_value) == "object"){
                result += "BEGIN:" + attr_name + "\n";
                result += writeICS(attr_value);
                result += "END:" + attr_name + "\n";
            } else {
                result += attr_name + ":" + attr_value + "\n";
            }
        }
    }

    return result;
}


function propfind( origSettings ) {
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'PROPFIND'},origSettings);
    var params = { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
        cache: s.cache,
    contentType: s.contentType,
    data: s.data,
    password: encodeURIComponent(s.password),
    username: encodeURIComponent(s.username),
    type: 'PROPFIND',
    url: s.url,
    complete: s.complete,
    withCredentials: true,
    };
    //params['success'] = $.httpoverride ( params, s.success );
    return jQuery.ajax ( params );
}

function getCalendarData(url, callback ) {
    var headers = {Depth:1};
    var bound = '';
    propfind ($.extend(true,{},{url:url,username:USERNAME, password:PASSWORD,headers:headers,data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
                       '<x0:propfind xmlns:x1="http://calendarserver.org/ns/" xmlns:x0="DAV:" xmlns:x3="http://apple.com/ns/ical/" xmlns:x2="urn:ietf:params:xml:ns:caldav" xmlns:x4="http://boxacle.net/ns/calendar/">' + "\n" +
    '<x0:prop>' + "\n" +
        '<x0:displayname/>' + "\n" +
        //'<x2:calendar-description/>' + "\n" +
        //'<x2:calendar-user-address-set/>' + "\n" +
        //'<x2:calendar-inbox-URL/>' + "\n" +
        //'<x2:calendar-outbox-URL/>' + "\n" +
        //'<x3:calendar-color/>' + "\n" +
        //'<x3:calendar-order/>' + "\n" +
        //'<x4:calendar-settings/>' + "\n" +
        //'<x4:calendar-subscriptions/>' + "\n" +
        '<x0:resourcetype/>' + "\n" +
        //'<x0:acl/>' + "\n" +
        //'<x0:owner/>' + "\n" +
        //'<x0:supported-privilege-set/>' + "\n" +
        //'<x0:supported-report-set/>' + "\n" +
        //'<x0:current-user-privilege-set/>' + "\n" + bound +
        '</x0:prop>' + "\n" +
        '</x0:propfind>'
        ,complete: function (r,s){
    if (s=='success')
        {
            console.log("success");
        }
        else
            {
                console.log ( 'error getting calendar data  ');
            }
            callback(r,s);
            return false;
        }
    })); return this; }
