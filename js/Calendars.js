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

    this.find = function(name){
        for (href_idx in this.calendars) {
            if (this.calendars[href_idx].name == name)
                return this.calendars[href_idx];
        }
        return null;
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

    var parts = this.href.split("/");
    if (parts[name.length - 1])
        this.name = parts[parts.length - 1];
    else
        this.name = parts[parts.length - 2];

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
                var e = new Event(data, this);
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

    this.getEvent = function(uid){
        return this.events[uid];
    }

    this.getFCEvents = function(start, end, timezone, callback) {
        if (this.ready && this.FCevents.length == 0) {
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

    this.putEvent = function(event) {
        var content = event.getICS();
            ajaxPut({url:this.href + "/" + event.uid + ".ics",contentType: 'text/calendar',data:content,complete: (function (r,s){
                console.log("Put " + s)
                this.events[event.uid] = event;
                this.FCevents.push(event.getFC());
            }).bind(this)});
    }

    this.delEvent = function(event) {
        var content = event.getICS();
            ajaxDel({url:this.href + "/" + event.uid + ".ics",contentType: 'text/calendar',data:content,complete: (function (r,s){
                console.log("Delete " + s)
                delete this.events[event.uid];
                delete this.FCevents;
            }).bind(this)});

                return null;
    }
}
