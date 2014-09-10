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
            var nbCal = 0;
            for (href_idx in this.calendarList) {
                if (this.calendarList[href_idx].indexOf("contact_birthdays") == -1) {
                    this.calendars[nbCal] = new Calendar(this.calendarList[href_idx], COLORS[nbCal]);
                    LOADINGBAR.registre(this.calendars[nbCal].name);
                    ENCRYPTBAR.registre(this.calendars[nbCal].name);
                    addEventSource(this.calendars[nbCal].getEventSource());
                    nbCal++;
                }
            }
            CALENDARS.loadAllCalendars();
        }, this));
    }

    this.loadAllCalendars = function () {
        for (href_idx in CALENDARS.calendars) {
            CALENDARS.calendars[href_idx].load(today, oneday="today", notalone=false);
            CALENDARS.calendars[href_idx].load(tomorow, oneday="tomorow", notalone=false);
            CALENDARS.calendars[href_idx].loadTodosList();
        }
    }

    this.find = function(name){
        for (href_idx in this.calendars) {
            console.log(this.calendars[href_idx].name);
            if (this.calendars[href_idx].name.toUpperCase() == name.toUpperCase())
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
    this.todosUrls = [];
    this.todos = {};
    this.eventsUrls = [];
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

    this.load = function (day, oneday, notalone){
        var key = formatDate(day);
        //if (!this.events.hasOwnProperty(key))
        this.loadEventList(day, oneday=oneday, notalone=notalone);
    }

    this.loadTodosList = function (){
        console.log("Loading todos list " + this.href);
        getTodosList(this.href, $.proxy(function (obj, status, r) {
            //console.log(r.responseXML);
            var urls = [];
            $(r.responseXML).find('href').each(function(index, element){
                el = $(element).text();
                if (el.endsWith(".ics")) {
                    urls.push(el);
                }
            });
            this.todosUrls = urls;
            this.todos = {};
            this.loadTodos(this);
        }, this));
    }

    this.loadEventList = function (start, oneday, notalone){
        if (oneday) {
            var stop = moment(start).add('days', 1);
            var key = oneday;
        } else {
            var stop = moment(start).add('days', 7);
            var key = formatDate(start);
        }
        console.log("Loading event list " + this.href + " for " + start.format("YYYY/MM/DD") + " (" + key + ") to " + stop.format("YYYY/MM/DD"));
        if (! notalone ) {
            LOADINGBAR.reset();
            ENCRYPTBAR.reset();
        }

        this.eventsCpt[key] = 0;
        getEventsList(this.href, start, stop, $.proxy(function (obj, status, r) {
            var urls = [];
            //console.log(r.responseXML);
            $(r.responseXML).find('href').each(function(index, element){
                el = $(element).text();
                if (el.endsWith(".ics")) {
                    urls.push(el);
                }
            });
            this.eventsUrls[key] = urls;
            this.eventsCpt[key] += urls.length;
            if (urls.length > 0) {
                LOADINGBAR.addTotal(this.name, urls.length);
                ENCRYPTBAR.addTotal(this.name, urls.length);
            } else {
                LOADINGBAR.empty();
                ENCRYPTBAR.empty();
            }
            this.events[key] = {};
            this.loadEvents(this, key);
        }, this));
    }

    this.todoLoaded = function(t){
        t.calendar.todos[t.uid] = t;
        //ENCRYPTBAR.incr(t.calendar.name);
        DASHBOARD.pushTodo(t);
    }
    this.eventLoaded = function(e){
        e.calendar.events[e.key][e.uid] = e;
        e.calendar.eventsTotallyLoaded[e.key]++;
        ENCRYPTBAR.incr(e.calendar.name);
        DASHBOARD.pushEvent(e);
        if (e.calendar.eventsTotallyLoaded[e.key] == e.calendar.eventsCpt[e.key]) {
            refetchEvents();
        }
    }

    this.loadTodos = function (self){
        for (t_idx in self.todosUrls){
            console.log("Downloading VTODO " + self.todosUrls[t_idx]);
            $.ajax({
                type: "GET",
                url: self.todosUrls[t_idx],
            }).done(function(data){
                var t = new Todo(data, self);
                //console.log(data);
                //LOADINGBAR.incr(self.name);
                t.load(self.todoLoaded);
                return data;
            });

        }
    }

    this.loadEvents = function (self, key){
        self.eventsLoaded[key] = 0;
        self.eventsTotallyLoaded[key] = 0;
        for (e_idx in self.eventsUrls[key]){
            console.log("Downloading VEVENT" + self.eventsUrls[key][e_idx]);
            $.ajax({
                type: "GET",
                url: self.eventsUrls[key][e_idx],
            }).done(function(data){
                var e = new Event(data, self, key);
                e.calendar.eventsLoaded[e.key]++;
                LOADINGBAR.incr(self.name);
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
            this.loadEventList(start, oneday=false, notalone=false);
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
                DASHBOARD.pushEvent(event);
                console.log("Put success " + event.uid);
            });
    }

    this.todoPuted = function(todo) {
        ajaxPut(todo.calendar.href + "/" + todo.uid + ".ics", todo.content, function (obj, s, r){
                DASHBOARD.pushTodo(todo);
                console.log("Put success " + todo.uid);
            });
    }

    this.putEvent = function(event) {
        LOADINGBAR.reset();
        ENCRYPTBAR.reset();
        if (event.encrypted) {
            ENCRYPTBAR.setTotal(event.calendar.name, 3);
        }
        event.calendar.events[event.calendar.currentDay][event.uid] = event;
        event.getICS(this.eventPuted);
    }

    this.putTodo = function(todo) {
        if (todo.encrypted) {
            ENCRYPTBAR.setTotal(todo.calendar.name, 3);
        }
        todo.calendar.todos[todo.uid] = todo;
        todo.getICS(this.todoPuted);
    }




    this.delEvent = function(event) {
        LOADINGBAR.reset();
        ajaxDel(event.calendar.href + "/" + event.uid + ".ics", "", function (obj, s, r){
                LOADINGBAR.end();
                console.log("Delete success " + event.uid);
                delete event.calendar.events[event.calendar.currentDay][event.uid];
                DASHBOARD.eventDeleteIfExist(event);
        });
    }
}
