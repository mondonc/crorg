TODO_TEMPLATE =
"BEGIN:VCALENDAR\n\
PRODID:-//Mozilla.org/NONSGML Mozilla Calendar V1.1//EN\n\
VERSION:2.0\n\
BEGIN:VTODO\n\
UID:25b8647c-e5c6-4bbd-9726-c9e235a2fc23\n\
SUMMARY:ssddssd\n\
STATUS:CANCELLED\n\
CATEGORIES:Work\n\
PERCENT-COMPLETE:0\n\
END:VTODO\n\
END:VCALENDAR\n\
";

// Event class
function Todo(datas, calendar) {

    this.calendar = calendar;
    this.d = {};
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
        console.log(this.datas);
        this.parseICS(this.d, this.datas.split("\n"), 0);
        if (this.d.VCALENDAR.PRODID == "-//CRORG//V0.1//EN") {
            this.encrypted = true;
            //ENCRYPTBAR.setTotal(this.calendar.name, ENCRYPTBAR.total[this.calendar.name]+3);
            CRYPTER.decrypt(this, callback, "VTODO");
        } else {
            callback(this);
        }
    }

    this.getICS = function(callback) {
        if (this.encrypted) {
            CRYPTER.encrypt(this, callback, "VTODO");
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

    this.findAttrVTODO = function(attrname) {
        for (prop in this.d.VCALENDAR.VTODO) {
            if (prop.startsWith(attrname)){
                return prop;
            }
        }
        return null;

    }

    this.getTableLine = function () {
        var per = this.d.VCALENDAR.VTODO["PERCENT-COMPLETE"];
        var loc = this.d.VCALENDAR.VTODO["LOCATION"];
        var begin_icon = "remove-sign";
        switch (this.d.VCALENDAR.VTODO["STATUS"]) {
            case "COMPLETED":
                begin_icon = "ok-sign";
                break;
            case "CANCELLED":
                begin_icon = "minus-sign";
                break;
        }
        if (!per) per = 0;
        if (!loc) loc = "";
        return '<tr><td class="col-md-1"><span class="glyphicon glyphicon-' + begin_icon + '"></span></td><td class="col-md-4"><b>' + this.d.VCALENDAR.VTODO.SUMMARY + '</b></td><td class="col-md-4"><i>' + loc + '</i></td><td class="col-md-1"><span class="badge badge-default">' + per + '%</span></td></tr>';
    }
}
