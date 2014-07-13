// Event class
function Event(datas) {

    this.parseICS = function(parent_object, data, idx) {

        while (idx < data.length) {
            if (data[idx]) {

                var line = data[idx].partition(":");
                var attr_name = line[0];
                var attr_value = line[1];

                if (attr_name == "BEGIN"){
                    var e = {};
                    idx = this.parseICS(e, data, idx + 1);
                    parent_object[attr_value.trim()] = e;

                } else if  (attr_name == "END") {
                    return idx + 1;

                } else {
                    parent_object[attr_name] = attr_value.trim();
                }
            }
            idx += 1;
        }
    }

    this.d = {};

    if (datas) {
        this.ics = datas;
        this.uid = datas.match(/UID:(.*)/)[1];
        this.parseICS(this.d, datas.split("\n"), 0);
    }

    this.getFC = function() {

        var e = this.d;

        if (e.VCALENDAR.hasOwnProperty("VTIMEZONE")) {
            var hours_offset = parseInt(e.VCALENDAR.VTIMEZONE.TZOFFSETTO.substring(0, 3));
            var minutes_offset = parseInt(e.VCALENDAR.VTIMEZONE.TZOFFSETTO.substring(3, 5));
            if (hours_offset >= 0) {
                minutes_offset = -minutes_offset;
            }
        } else {
            var hours_offset = 0;
            var minutes_offset = 0;
        }

        if (e.VCALENDAR.hasOwnProperty("VEVENT")) {
            var FCevent = {};
            for (prop in e.VCALENDAR.VEVENT) {

                if (prop.startsWith("DTSTART")) {
                    var startDate = parseDate(prop ,e.VCALENDAR.VEVENT[prop]);
                    var tz = tzidPattern.exec(prop);
                    if (tz){
                        startDate.setUTCHours(startDate.getUTCHours() - hours_offset);
                        startDate.setUTCMinutes(startDate.getUTCMinutes() - minutes_offset);
                    }
                    FCevent["start"] = startDate.toISOTZString();
                    if (prop.endsWith("VALUE=DATE")) {
                        FCevent["allDay"] = true;
                    }

                } else if (prop.startsWith("DTEND")) {
                    var stopDate = parseDate(prop, e.VCALENDAR.VEVENT[prop]);
                    var tz = tzidPattern.exec(prop);
                    if (tz){
                        stopDate.setUTCHours(stopDate.getUTCHours() - hours_offset);
                        stopDate.setUTCMinutes(stopDate.getUTCMinutes() - minutes_offset);
                    }
                    FCevent["end"] = stopDate.toISOTZString();

                } else if (prop.startsWith("SUMMARY")) {
                    FCevent["title"] = e.VCALENDAR.VEVENT[prop];

                } else if (prop.startsWith("UID")) {
                    FCevent["id"] = e.VCALENDAR.VEVENT[prop];
                }
            }
            //FCevent["textColor"] = "red";
            //FCevent["backgroundColor"] = "green";
            //FCevent["borderColor"] = "yellow";
            return FCevent;
        }
        return null;
    }

    this.getICS = function() {
        var result = "";
        for(var propertyName in this.d) {

            if (propertyName) {
                var attr_name = propertyName;
                var attr_value = this.d[attr_name];

                if (typeof(attr_value) == "object"){
                    result += "BEGIN:" + attr_name + "\n";
                    result += writeICS(attr_value);
                    result += "END:" + attr_name + "\n";
                } else {
                    result += attr_name + ":" + attr_value + "\n";
                }
            }
        }
        return result;
    }
}
