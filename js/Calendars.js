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

    this.loadAllCalendars = function () {
        for (href_idx in CALENDARS.calendars) {
            CALENDARS.calendars[href_idx].load();
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
    this.ready = false;
    this.eventsCpt = {};
    this.eventsLoaded = {};
    this.currentDay = "";

    var parts = this.href.split("/");
    if (parts[name.length - 1])
        this.name = parts[parts.length - 1];
    else
        this.name = parts[parts.length - 2];

    this.load = function (){
        this.loadEventList(first_day, false);
    }

    this.loadEventList = function (start, refetchNeeded){
        console.log("Loading " + this.href + " for " + start.format("YYYYMMDD"));
        var stop = moment(start).add('days', 7);
        var key = formatDate(start);

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
            this.events[key] = {};
            this.loadEvents(this, start, refetchNeeded);
        }, this));
    }

    this.loadEvents = function (self, start, refetchNeeded){
        var key = formatDate(start);
        self.eventsLoaded[key] = 0;
        for (e_idx in self.urls[key]){
            console.log("Downloading " + self.urls[key][e_idx]);
            $.ajax({
                type: "GET",
                url: self.urls[key][e_idx],
            }).done(function(data){
                var e = new Event(data, self);
                self.events[key][e.uid] = e;
                self.eventsLoaded[key]++;
                if (self.eventsLoaded[key] == self.eventsCpt[key]) {
                    self.ready = true;
                    if (refetchNeeded) {
                        refetchEvents();
                    }
                }
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
            this.loadEventList(start, true)
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

    this.putEvent = function(event) {
        var content = event.getICS();
        console.log(this.href);
        console.log(event.uid);
        ajaxPut(this.href + "/" + event.uid + ".ics", content, (function (obj, s, r){
                console.log("Put success " + event.uid);
                this.events[this.currentDay][event.uid] = event;
            }).bind(this));
    }

    this.delEvent = function(event) {
        var content = event.getICS();
            ajaxDel(this.href + "/" + event.uid + ".ics", content, (function (obj, s, r){
                console.log("Delete success " + event.uid);
                delete this.events[this.currentDay][event.uid];
            }).bind(this));

                return null;
    }
}
