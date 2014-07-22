var COLORS = [
    {
        borderColor: "#3a87ad",
        backgroundColor: "#3a87ad",
        textColor: "white",
        unconfirmedColor: "#a2bac6",
    },
    {
        borderColor: "#3aad52",
        backgroundColor: "#3aad52",
        textColor: "white",
        unconfirmedColor: "#8ac497",
    },
    {
        borderColor: "#ad3a3a",
        backgroundColor: "#ad3a3a",
        textColor: "white",
        unconfirmedColor: "#dc9797",
    },
    {
        borderColor: "#a9ad3a",
        backgroundColor: "#a9ad3a",
        textColor: "white",
        unconfirmedColor: "#e4e797",
    },
];

// Calendars class
function Calendars() {

    this.calendars = [];
    this.calendarList = [];

    this.load = function (callback){
        getCalendarData(CALDAV_URL, $.proxy(function (r) {
            calendarList = [];
            $(r.responseXML).find('response').each(function(index, element){
                if ($(element).find("calendar").length >= 1){
                    calendarList.push($(element).find("href").text());
                }
            });
            this.calendarList = calendarList;
            for (href_idx in this.calendarList) {
                this.calendars[href_idx] = new Calendar(this.calendarList[href_idx], COLORS[href_idx]);
            }
            callback();
            this.loadAllCalendars();
        }, this));
    }

    this.loadAllCalendars = function () {
        for (href_idx in this.calendars) {
            this.calendars[href_idx].load();
        }

    }
}

// Calendar class
function Calendar(href, colors) {
    this.href = href;
    this.urls = [];
    this.events = {};
    this.FCevents = [];
    this.eventsCpt = 0;
    this.eventsLoaded = 0;
    this.borderColor = colors["borderColor"];
    this.backgroundColor = colors["backgroundColor"];
    this.textColor = colors["textColor"];
    this.unconfirmedColor = colors["unconfirmedColor"];
    this.ready = false;

    this.load = function (){
        this.loadEventList((this.loadEvents).bind(this));
    }

    this.loadEventList = function (callback){
        console.log("Loading " + this.href);

        this.eventsCpt = 0;
        getCalendarData(this.href, $.proxy(function (r) {
            this.name = $(r.responseXML).find('displayname').text();
            urls = [];
            eCpt = 0;
            $(r.responseXML).find('href').each(function(index, element){
                el = $(element).text();
                if (el.endsWith(".ics")) {
                    urls.push(el);
                    eCpt++;
                }

            });
            this.urls = urls;
            this.eventsCpt += eCpt;
            callback();
        }, this));
    }

    this.loadEvents = function (){
        this.eventsLoaded = 0;
        for (e_idx in this.urls){
            console.log("Downloading " + this.urls[e_idx]);
            $.ajax({
                type: "GET",
                url: this.urls[e_idx],
            }).done((function(data){
                var e = new Event(data);
                this.events[e.uid] = e;
                this.eventsLoaded++;
                if (this.eventsLoaded == this.eventsCpt) {
                    this.ready = true;
                    addEventSource(this.getEventSource.bind(this)());
                }
                return data;
            }).bind( this ));
        }
    }

    this.getFCEvents = function(start, end, timezone, callback) {
        if (this.ready && this.FCevents.length == 0) {
            console.log("Translating events ");
            for (var uid in this.events) {
                FCe = this.events[uid].getFC();
                if (FCe)
                    this.FCevents.push(FCe);
            }
        }
        callback(this.FCevents);
    }

    this.getEventSource = function(){
        //return this.getFCEvents;
        return {
            events: (this.getFCEvents).bind(this),
            textColor: this.textColor,
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor,
        };
    }


    this.putEvent = function( params , content ) {
        $.fn.caldav('spinner',true);
        var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options,params);
        if ( $.fn.caldav.locks[params.url] )
            {
                if ( tmpOptions.headers == undefined ) tmpOptions.headers = {};
                tmpOptions.headers['If']= $.fn.caldav.locks[params.url].token;
                if ( tmpOptions['Schedule-Reply'] != undefined ) tmpOptions.headers['Schedule-Reply'] = tmpOptions['Schedule-Reply'] ;
                $.put ($.extend(true,tmpOptions,{contentType:'text/calendar',data:content,complete: function (r,s){
                    $.fn.caldav('spinner',false);
                    $.fn.caldav('unlock',params.url);
                    $.fn.caldav.options.eventPut(r,s);
                }
                }));
            }
            else
                {
                    $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
                        if ( r.status != 404 )
                            tmpOptions.headers['If-Match']=r.getResponseHeader('ETag');
                        $.put ($.extend(true,tmpOptions,{contentType:'text/calendar',data:content,complete: function (r,s){
                            $.fn.caldav('spinner',false);
                            $.fn.caldav.options.eventPut(r,s);}
                        }))
                    }}));
                }
                return this;
    }

    this.putNewEvent = function( url , event ) {
        var content = event.getICS();
            ajaxPut({url:url + "/" + e.uid + ".ics",contentType: 'text/calendar',data:content,complete: function (r,s){
                console.log("Putté " + r + " " + s)
            }});
    }

    this.delEvent = function( params ) {
        $.fn.caldav('spinner',true);
        var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options,params);
        if ( $.fn.caldav.locks[params.url] )
            {
                if ( tmpOptions.headers == undefined ) tmpOptions.headers = {};
                tmpOptions.headers['If']= $.fn.caldav.locks[params.url].token;
                var headers = {};
                if ( tmpOptions['Schedule-Reply'] != undefined ) tmpOptions.headers['Schedule-Reply'] = tmpOptions['Schedule-Reply'] ;
                $.del ($.extend(true,tmpOptions,{data:null,complete: function (r,s){
                    $.fn.caldav('spinner',false);
                    delete $.fn.caldav.locks[params.url];
                    $.fn.caldav.options.eventDel(params.url);}
                }));
            }
            else
                {
                    delete tmpOptions.headers;
                    $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
                        if ( r.status != 200 && r.status != 207 )
                            { r.abort();
                                $.fn.caldav('spinner',false);
                                return false; }
                                var headers = {};
                                if ( tmpOptions['Schedule-Reply'] != undefined ) tmpOptions.headers['Schedule-Reply'] = tmpOptions['Schedule-Reply'] ;
                                tmpOptions.headers={'If-Match':r.getResponseHeader('ETag')};
                                $.del ($.extend(true,tmpOptions,{data:null,complete: function (r,s){
                                    $.fn.caldav('spinner',false);
                                    $.fn.caldav.options.eventDel(params.url);}
                                }))
                    }}));
                }
                return this;
    }

    this.moveEvent = function( params ) {
        $.fn.caldav('spinner',true);
        if ( $.fn.caldav.locks[params.url] )
            params.headers['If']= $.fn.caldav.locks[params.url].token;
        $.move ($.extend(true,{},jQuery.fn.caldav.options,params,{complete: function (r,s){
            $.fn.caldav('spinner',false);
            if ( $.fn.caldav.locks[params.url] )
                delete $.fn.caldav.locks[params.url];
            $.fn.caldav.options.eventPut(r,s);}
        }));
        return this;
    }

}
