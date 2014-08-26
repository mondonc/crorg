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

    this.load = function (){
        getCalendarData(CALDAV_URL, $.proxy(function (datasObj, status, r) {
            calendarList = [];
            $(r.responseXML).find('response').each(function(index, element){
                if ($(element).find("calendar").length >= 1){
                    calendarList.push($(element).find("href").text());
                }
            });
            this.calendarList = calendarList;
            for (href_idx in this.calendarList) {
                this.calendars[href_idx] = new Calendar(this.calendarList[href_idx], COLORS[href_idx]);
                addEventSource(this.calendars[href_idx].getEventSource());
            }
            //CALENDARS.loadAllCalendars();
        }, this));
    }

    this.loadAllCalendars = function (day) {
        for (href_idx in CALENDARS.calendars) {
            CALENDARS.calendars[href_idx].load(day);
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
    this.borderColor = colors["borderColor"];
    this.backgroundColor = colors["backgroundColor"];
    this.textColor = colors["textColor"];
    this.unconfirmedColor = colors["unconfirmedColor"];
    this.urls = [];
    this.events = {};
    this.eventsCpt = {};
    this.eventsLoaded = {};
    this.eventsTotallyLoaded = {};
    this.currentDay = "";

    var parts = this.href.split("/");
    if (parts[name.length - 1])
        this.name = parts[parts.length - 1];
    else
        this.name = parts[parts.length - 2];

    this.load = function (day){
        var key = formatDate(day);
        if (!this.events.hasOwnProperty(key))
            this.loadEventList(day);
    }

    this.loadEventList = function (start){
        var stop = moment(start).add('days', 7);
        var key = formatDate(start);
        console.log("Loading event list " + this.href + " for " + start.format("YYYY/MM/DD") + " (" + key + ")");
        LOADINGBAR.reset();
        ENCRYPTBAR.reset();

        this.eventsCpt[key] = 0;
        getEventsList(this.href, start, stop, $.proxy(function (obj, status, r) {
            var urls = [];
            $(r.responseXML).find('href').each(function(index, element){
                el = $(element).text();
                if (el.endsWith(".ics")) {
                    urls.push(el);
                }
            });
            this.urls[key] = urls;
            this.eventsCpt[key] += urls.length;
            if (urls.length > 0) {
                LOADINGBAR.total += urls.length;
                ENCRYPTBAR.total += urls.length;
            } else {
                LOADINGBAR.end();
                ENCRYPTBAR.end();
            }
            this.events[key] = {};
            this.loadEvents(this, start);
        }, this));
    }

    this.eventLoaded = function(e){
        e.calendar.events[e.key][e.uid] = e;
        e.calendar.eventsTotallyLoaded[e.key]++;
        ENCRYPTBAR.incr();
        if (e.calendar.eventsTotallyLoaded[e.key] == e.calendar.eventsCpt[e.key]) {
            refetchEvents();
        }
    }

    this.loadEvents = function (self, start){
        var key = formatDate(start);
        self.eventsLoaded[key] = 0;
        self.eventsTotallyLoaded[key] = 0;
        for (e_idx in self.urls[key]){
            console.log("Downloading " + self.urls[key][e_idx]);
            $.ajax({
                type: "GET",
                url: self.urls[key][e_idx],
            }).done(function(data){
                var e = new Event(data, self, key);
                e.calendar.eventsLoaded[e.key]++;
                LOADINGBAR.incr();
                e.load(self.eventLoaded);
                return data;
            });
        }
    }

    this.getEvent = function(uid){
        for (key in this.events){
            if (this.events[key].hasOwnProperty(uid)){
                return this.events[key][uid];
            }
        }
        console.log("Unable to find " + uid);
        return null;
    }

    this._getFCEvents = function(start, events, callback) {
        var key = formatDate(start);

        if (events.hasOwnProperty(key)) {
            var fclist = [];
            for (var uid in events[key]) {
                FCe = events[key][uid].getFC();
                if (FCe)
                    fclist.push(FCe);
            }
            callback(fclist);
        } else {
            this.loadEventList(start);
        }
    }

    this.getFCEvents = function(start, end, timezone, callback) {
        this.currentDay = formatDate(start);
        this._getFCEvents(start, this.events, callback);
    }

    this.getEventSource = function(){
        return {
            events: $.proxy(this.getFCEvents, this),
            textColor: this.textColor,
            backgroundColor: this.backgroundColor,
            borderColor: this.borderColor,
        };
    }

    this.eventPuted = function(event) {
        ENCRYPTBAR.end();
        ajaxPut(event.calendar.href + "/" + event.uid + ".ics", event.content, function (obj, s, r){
                LOADINGBAR.end();
                console.log("Put success " + event.uid);
                event.calendar.events[event.calendar.currentDay][event.uid] = event;
            });
    }

    this.putEvent = function(event) {
        LOADINGBAR.reset();
        ENCRYPTBAR.reset();
        if (event.encrypted) {
            ENCRYPTBAR.total = 3;
        }
        event.getICS(this.eventPuted);
    }



    this.delEvent = function(event) {
        LOADINGBAR.reset();
        ajaxDel(event.calendar.href + "/" + event.uid + ".ics", "", function (obj, s, r){
                LOADINGBAR.end();
                console.log("Delete success " + event.uid);
                delete event.calendar.events[event.calendar.currentDay][event.uid];
        });
    }
}
