EVENT_TEMPLATE = "BEGIN:VCALENDAR\n\
PRODID:-//Mozilla.org/NONSGML Mozilla Calendar V1.1//EN\n\
VERSION:2.0\n\
BEGIN:VEVENT\n\
UID:8c122d5a-ab1e-410d-a0cc-56166b440001\n\
SUMMARY:New Event\n\
DTSTART:20140721T150000\n\
DTEND:20140721T160000\n\
LOCATION:ici\n\
DESCRIPTION:description\n\
END:VEVENT\n\
END:VCALENDAR\n\
";

// Event class
function Event(datas, calendar, startdate) {

    this.calendar = calendar;
    this.d = {};
    this.key = startdate;
    this.encrypted = false;
    this.datas = datas;
    this.start = null;
    this.end = null;
    this.allDay = false;

    this.parseICS = function(parent_object, data, idx) {

        while (idx < data.length) {
            if (data[idx]) {

                if (data[idx].startsWith(" ")) {
                    parent_object[attr_name] += data[idx].trim();
                    idx += 1;
                    continue;
                }
                var line = data[idx].partition(":");
                var attr_name = line[0];
                var attr_value = line[1];

                if (attr_name == "BEGIN"){
                    var e = {};
                    idx = this.parseICS(e, data, idx + 1);
                    parent_object[attr_value.trim()] = e;

                } else if  (attr_name == "END") {
                    return idx;

                } else {

                    if (attr_name == "") {
                        parent_object[attr_value] = null;
                    } else {
                        parent_object[attr_name] = attr_value.trim();
                    }
                }
            }
            idx += 1;
        }
        //return idx;
    }

    this.load = function(callback) {
        this.uid = this.datas.match(/UID:(.*)/)[1];
        this.parseICS(this.d, this.datas.split("\n"), 0);
        this.start = this.getMomentStart();
        this.end = this.getMomentEnd();
        if (this.d.VCALENDAR.PRODID == "-//CRORG//V0.1//EN") {
            this.encrypted = true;
            ENCRYPTBAR.setTotal(this.calendar.name, ENCRYPTBAR.total[this.calendar.name]+3);
            CRYPTER.decrypt(this, callback);
        } else {
            callback(this);
        }
    }

    this.getFC = function() {

        var e = this.d.VCALENDAR.VEVENT;

        var FCevent = {};

        FCevent["start"] = this.start.format("YYYY-MM-DDTHH:mm:ss");
        FCevent["start"] += "Z";
        FCevent["allDay"] = this.allDay;

        if (this.end) {
            FCevent["end"] = this.end.format("YYYY-MM-DDTHH:mm:ss");
            FCevent["end"] += "Z";
        }

        FCevent["title"] = e["SUMMARY"];
        FCevent["description"] = e["DESCRIPTION"];
        FCevent["location"] = e["LOCATION"];

        FCevent["id"] = e["UID"];
        FCevent["textColor"] = this.calendar.textColor;
        FCevent["backgroundColor"] = this.calendar.backgroundColor;
        FCevent["borderColor"] = this.calendar.borderColor;
        FCevent["calendar"] = this.calendar;
        FCevent["encrypted"] = this.encrypted;
        //console.log(FCevent);
        return FCevent;
    }

    this.getICS = function(callback) {
        if (this.encrypted) {
            CRYPTER.encrypt(this, callback);
        } else {
            this.content = this._getICS(this.d);
            callback(this);
        }
    }

    this._getICS = function(obj) {
        var result = "";
        for(var propertyName in obj) {

            if (propertyName) {
                var attr_name = propertyName;
                var attr_value = obj[attr_name];

                if (typeof(attr_value) == "object" && attr_value != null){
                    result += "BEGIN:" + attr_name + "\n";
                    result += this._getICS(attr_value);
                    result += "END:" + attr_name + "\n";
                } else {
                    if (attr_value != null) {
                        result += attr_name + ":" + attr_value + "\n";
                    } else {
                        result += attr_name + "\n";
                    }
                }
            }
        }
        return result;
    }

    this.findAttrVEvent = function(attrname) {
        for (prop in this.d.VCALENDAR.VEVENT) {
            if (prop.startsWith(attrname)){
                return prop;
            }
        }
        return null;
    }


    this._updateProp = function(mom, allday, name, shortname) {

        var prop = this.findAttrVEvent(name);
        var tz = tzidPattern.exec(prop);
        delete this.d.VCALENDAR.VEVENT[prop];

        if (mom == null) {
            this.allDay = true;
            return true;
        }

        this[shortname] = mom.utc();
        if (allday) {
            this.d.VCALENDAR.VEVENT[name + ";VALUE=DATE"] = mom.startOf("day").format("YYYYMMDD");
            this.allDay = true;
        } else {
            this.allDay = false;
            if (tz){
                this.d.VCALENDAR.VEVENT[prop] = mom.tz(tz[1].replace(/"/g, '')).format("YYYYMMDDTHHmmss");
            } else {
                this.d.VCALENDAR.VEVENT[name] = mom.utc().format("YYYYMMDDTHHmmss");
                this.d.VCALENDAR.VEVENT[name] += "Z";
            }
        }
    }

    this.updateDTSTART = function(start, allDay) {
        this._updateProp(start, allDay, "DTSTART", "start");
    }

    this.updateDTEND = function(end, allDay) {
        if (allDay && end != null)
            end.add('day', 1);
        this._updateProp(end, allDay, "DTEND", "end");
   }

    this.getTableLine = function (reference) {
        var s = this.getMomentStart();
        var e = this.getMomentEnd();
        s.tz();
        var begin = "";
        var end = "";
        if (this.allDay) {
            begin = '<span class="glyphicon glyphicon-resize-vertical"></span>';
            end = ' ';
        } else {
            if (!s.isSame(reference, 'day')) {
                begin = '&#8630';
            }
            if (!e.isSame(reference, 'day')) {
                end = '&#8631;';
            }
        }
        if (!begin) {
            begin = moment(s.toDate()).format("HH:mm");
        }
        if (!end) {
            end = moment(e.toDate()).format("HH:mm");
        }
        return "<tr><td>" + begin + "<br/>" + end + "</td><td><b>" + this.d.VCALENDAR.VEVENT.SUMMARY + "</b></td><td><i>" + this.d.VCALENDAR.VEVENT.DESCRIPTION + "</i></td><td>(" + this.d.VCALENDAR.VEVENT.LOCATION + ")</td></tr>";

    }

    this._getMoment = function (prop) {
        var tz = tzidPattern.exec(prop);
        var allday = allDayPattern.exec(prop);
        this.allDay = false;
        if (tz){
            var mom = moment.tz(this.d.VCALENDAR.VEVENT[prop], "YYYYMMDDTHHmm", tz[1].replace(/"/g, ''));
        } else if (allday) {
            var mom = moment.utc(this.d.VCALENDAR.VEVENT[prop], "YYYYMMDD");
            this.allDay = true;
        } else {
            var mom = moment.utc(this.d.VCALENDAR.VEVENT[prop], "YYYYMMDDTHHmm");
        }
        return mom.utc();
    }

    this.getMomentStart = function () {
        var prop = this.findAttrVEvent("DTSTART");
        return this._getMoment(prop);
    }

    this.getMomentEnd = function () {
        var prop = this.findAttrVEvent("DTEND");
        if (!prop) {
            return null;
        }
        return this._getMoment(prop);
    }

    this.isToday = function() {
        var start = this.getMomentStart();
        var end = this.getMomentEnd();

        if (!end && start.isSame(today, 'day'))
            return start;

        if (end && moment.utc().range(start.startOf('day'), end.startOf('day')).contains(today)) {
            return start;
        } else {
            return false;
        }

    }

    this.isTomorow = function() {
        var start = this.getMomentStart();
        var end = this.getMomentEnd();

        if (!end && start.isSame(tomorow, 'day'))
            return start;

        if (end && moment.utc().range(start.startOf('day'), end.subtract("s", 1).startOf('day')).contains(tomorow)) {
            return start;
        } else {
            return false;
        }

    }
}
