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
        if (this.d.VCALENDAR.PRODID == "-//CRORG//V0.1//EN") {
            this.encrypted = true;
            ENCRYPTBAR.total += 3;
            CRYPTER.decrypt(this, callback);
        } else {
            callback(this);
        }
    }

    this.getFC = function() {

        var e = this.d;

        if (e.VCALENDAR.hasOwnProperty("VEVENT")) {
            var FCevent = {};
            for (prop in e.VCALENDAR.VEVENT) {

                if (prop.startsWith("DTSTART")) {
                    var tz = tzidPattern.exec(prop);
                    if (tz){
                        var startDate = moment.tz(e.VCALENDAR.VEVENT[prop], "YYYYMMDDTHHmm", tz[1].replace(/"/g, ''));
                    } else {
                        var startDate = moment.utc(e.VCALENDAR.VEVENT[prop], "YYYYMMDDTHHmm");
                    }
                    FCevent["start"] = startDate.utc().format("YYYY-MM-DDTHH:mm:ss");
                    FCevent["start"] += "Z";
                    if (prop.endsWith("VALUE=DATE")) {
                        FCevent["allDay"] = true;
                    }

                } else if (prop.startsWith("DTEND")) {
                    var tz = tzidPattern.exec(prop);
                    if (tz){
                        var stopDate = moment.tz(e.VCALENDAR.VEVENT[prop], "YYYYMMDDTHHmm", tz[1].replace(/"/g, ''));
                    } else {
                        var stopDate = moment.utc(e.VCALENDAR.VEVENT[prop], "YYYYMMDDTHHmm");
                    }

                    FCevent["end"] = stopDate.utc().format("YYYY-MM-DDTHH:mm:ss");
                    FCevent["end"] += "Z";

                } else if (prop.startsWith("SUMMARY")) {
                    FCevent["title"] = e.VCALENDAR.VEVENT[prop];

                } else if (prop.startsWith("DESCRIPTION")) {
                    FCevent["description"] = e.VCALENDAR.VEVENT[prop];

                } else if (prop.startsWith("LOCATION")) {
                    FCevent["location"] = e.VCALENDAR.VEVENT[prop];

                } else if (prop.startsWith("UID")) {
                    FCevent["id"] = e.VCALENDAR.VEVENT[prop];
                }
            }
            FCevent["textColor"] = this.calendar.textColor;
            FCevent["backgroundColor"] = this.calendar.backgroundColor;
            FCevent["borderColor"] = this.calendar.borderColor;
            FCevent["calendar"] = this.calendar;
            FCevent["encrypted"] = this.encrypted;
            return FCevent;
        }
        return null;
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

    this.updateDTSTART = function(start, allday) {
        var prop = this.findAttrVEvent("DTSTART");
        var tz = tzidPattern.exec(prop);
        if (tz){
            this.d.VCALENDAR.VEVENT[prop] = start.tz(tz[1].replace(/"/g, '')).format("YYYYMMDDTHHmmss");
            //this.d.VCALENDAR.VEVENT[prop] += "Z";
            return true;
        }
        if (allday) {
            delete this.d.VCALENDAR.VEVENT[prop];
            this.d.VCALENDAR.VEVENT["DTSTART;VALUE=DATE"] = start.format("YYYYMMDD");
        } else {
            delete this.d.VCALENDAR.VEVENT[prop];
            this.d.VCALENDAR.VEVENT["DTSTART"] = start.utc().format("YYYYMMDDTHHmmss");
            this.d.VCALENDAR.VEVENT["DTSTART"] += "Z";
        }
    }
    this.updateDTEND = function(end, allday) {

        var prop = this.findAttrVEvent("DTEND");

        if (end != null) {
            var tz = tzidPattern.exec(prop);
            if (tz){
                this.d.VCALENDAR.VEVENT[prop] = end.tz(tz[1].replace(/"/g, '')).format("YYYYMMDDTHHmmss");
                //this.d.VCALENDAR.VEVENT[prop] += "Z";
                return true;
            }
            if (allday) {
                delete this.d.VCALENDAR.VEVENT[prop];
                this.d.VCALENDAR.VEVENT["DTEND;VALUE=DATE"] = end.format("YYYYMMDD");
            } else {
                delete this.d.VCALENDAR.VEVENT[prop];
                this.d.VCALENDAR.VEVENT["DTEND"] = end.utc().format("YYYYMMDDTHHmmss");
                this.d.VCALENDAR.VEVENT["DTEND"] += "Z";
            }

        } else {
            delete this.d["VCALENDAR"]["VEVENT"]["DTEND"];
        }

    }

}
