// Calendars class
function Calendars() {

    this.calendars = [];
    this.calendarList = [];

    this.load = function (callback){
        getCalendarData(CALDAV_URL, $.proxy(function (r) {
            console.log("callback");
            calendarList = [];
            $(r.responseXML).find('response').each(function(index, element){
                if ($(element).find("calendar").length >= 1){
                    calendarList.push($(element).find("href").text());
                }
            });
            this.calendarList = calendarList;
            for (href_idx in this.calendarList) {
                this.calendars[href_idx] = new Calendar(this.calendarList[href_idx]);
            }
            this.loadAllCalendars();
            callback();
        }, this));
    }

    this.loadAllCalendars = function () {
        for (href_idx in this.calendars) {
            this.calendars[href_idx].load();
        }

    }
}

// Calendar class
function Calendar(href) {
    this.href = href;
    this.urls = [];
    this.events = {};
    this.FCevents = [];
    this.eventsCpt = 0;
    this.eventsLoaded = 0;
    this.color = "blue";
    this.textColor = "white";
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
        console.log("appel getFCevent");
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
            color: this.color,
            textColor: this.textColor,
        };
    }
}
