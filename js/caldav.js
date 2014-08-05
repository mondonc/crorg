ICScpt_last = 0;

function getEventsList(url, start, stop, callback) {
    var params = {
        contentType: 'text/xml',
        data: '<?xml version="1.0" encoding="utf-8" ?>' + '\n' +
            '<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">' + '\n' +
            '<D:prop>' + '\n' +
            '<D:getetag/>' + '\n' +
            '<C:calendar-data/>' + '\n' +
            '</D:prop>' + '\n' +
            '<C:filter>' + '\n' +
            '<C:comp-filter name="VCALENDAR">' + '\n' +
            '<C:comp-filter name="VEVENT">' + '\n' +
            '<C:time-range start="' + formatDate(start) + '" end="' + formatDate(stop) + '"/>' + '\n' +
            '</C:comp-filter>' + '\n' +
            '</C:comp-filter>' + '\n' +
            '</C:filter>' + '\n' +
            '</C:calendar-query>',
        password: encodeURIComponent(PASSWORD),
        username: encodeURIComponent(USERNAME),
        type: 'REPORT',
        url: url,
        success: callback,
        withCredentials: true,
    };
    return jQuery.ajax (params);
}



function getCalendarData(url, callback) {
    $.ajaxSetup.headers = {};
    var params = {
        contentType: 'text/xml',
        data: '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
            '<x0:propfind xmlns:x1="http://calendarserver.org/ns/" xmlns:x0="DAV:" xmlns:x3="http://apple.com/ns/ical/" xmlns:x2="urn:ietf:params:xml:ns:caldav" xmlns:x4="http://boxacle.net/ns/calendar/">' + "\n" +
            '<x0:prop>' + "\n" +
            '<x0:displayname/>' + "\n" +
            '<x0:resourcetype/>' + "\n" +
            '</x0:prop>' + "\n" +
            '</x0:propfind>',
        password: encodeURIComponent(PASSWORD),
        username: encodeURIComponent(USERNAME),
        type: 'PROPFIND',
        url: url,
        success: callback,
        withCredentials: true,
    };
    return jQuery.ajax ( params );
}

function ajaxPut(url, data, callback) {
        return jQuery.ajax ( {
            contentType: 'text/calendar',
            data: data,
            password: encodeURIComponent(PASSWORD),
            username: encodeURIComponent(USERNAME),
            type: 'PUT',
            url: url,
            success: callback,
        }
                           );
    }

function ajaxDel(url ,data, callback) {
        return jQuery.ajax ( {
            contentType: 'text/calendar',
            data: data,
            password: encodeURIComponent(PASSWORD),
            username: encodeURIComponent(USERNAME),
            type: 'DELETE',
            url: url,
            success: callback,
        });
    }

