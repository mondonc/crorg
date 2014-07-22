

ICScpt_last = 0;



function propfind( origSettings ) {
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'PROPFIND'},origSettings);
    var params = {
        beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
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
    propfind ($.extend(true,{},{url:url, username:USERNAME, password:PASSWORD,headers:headers,data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
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

function ajaxHead ( origSettings ) {
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'OPTIONS'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'HEAD',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      }

function ajaxPut( origSettings ) {
        $.ajaxSetup.headers = {};
        var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'PUT'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                            cache: s.cache,
                        contentType: s.contentType,
                        data: s.data,
                        password: encodeURIComponent(PASSWORD),
                        username: encodeURIComponent(USERNAME),
                        type: 'PUT',
                        url: s.url,
                        success: s.success,
                        complete: s.complete,
        }
                           );
    }

