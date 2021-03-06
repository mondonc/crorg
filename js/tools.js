
function pad(number) {
    var r = String(number);
    if ( r.length === 1 ) {
        r = '0' + r;
    }
    return r;
}

function toISOTZString(date) {
    return date.getUTCFullYear()
    + '-' + pad( date.getUTCMonth() + 1 )
    + '-' + pad( date.getUTCDate() )
    + 'T' + pad( date.getUTCHours() )
    + ':' + pad( date.getUTCMinutes() )
    + ':' + pad( date.getUTCSeconds() )
    + '.' + String( (date.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
    + 'Z';
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
};
String.prototype.partition = function(index) {
    var pos = this.indexOf(index);
    return [this.substring(0, pos), this.substring(pos+1)];
};
// Create Basic auth string (for HTTP header)
function basicAuth(user, password)
{
    var tok=user+':'+password;
    var hash=btoa(tok);
    return 'Basic '+hash;
}

var validDate = /^([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?([Zz])?$/;
var validDuration = /([-+])?P([0-9]+W)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+S)?)?/;
var localOffset = new Date().getTimezoneOffset();
//var tzidPattern = /(?<=TZID=)[^:]+/;
//var tzidPattern = /TZID=/;
var tzidPattern = /TZID=([^:]+)/;
var allDayPattern = /VALUE=DATE/;

function parseDate( key, str) {
    var year = parseInt( str.substring(0,4), 10);
    var month = parseInt( str.substring(4,6), 10);
    var day = parseInt( str.substring(6,8), 10);

    var res = new Date();
    res.setUTCFullYear( year, month - 1, day );


    if (!key.endsWith("VALUE=DATE")) {
        var ofs = str.indexOf( 'T' ) + 1;
        var h = parseInt( str.substring(ofs,ofs+2), 10);
        var min = parseInt( str.substring(ofs+2,ofs+4), 10);
        var sec = parseInt( str.substring(ofs+4,ofs+6), 10);
        res.setUTCHours(h);
        res.setUTCMinutes(min);
        res.setUTCSeconds(sec);
    }
    return res;
}

function addEventSource(es){
    try {
        $('#calendar').fullCalendar('addEventSource', es);
    } catch (err) {
        console.log("Ignoring fullcalendar warning");
    }
}

function refetchEvents(){
    try {
        $('#calendar').fullCalendar('refetchEvents');
    } catch (err) {
        console.log("Ignoring fullcalendar warning");
    }
}

function refetchSource(calendar){
    $("#calendar").fullCalendar( 'removeEventSource', calendar.getEventSource() );
    $("#calendar").fullCalendar( 'addEventSource', calendar.getEventSource() );
}

function guid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }).toUpperCase();
}

function formatDate(ds) {
   function pad(n){return n<10 ? '0'+n : n}

     var d = new Date(ds);
     return d.getUTCFullYear() + ''
      + pad(d.getUTCMonth()+1) + ''
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours()) + ''
      + pad(d.getUTCMinutes()) + ''
      + pad(d.getUTCSeconds())+'Z';
}

function eventInList(e, l) {
    for (i in l) {
        if (l[i].uid == e.uid) {
            return i;
        }
    }
    return -1;
}

function newTodo(cat) {
    console.log("New Todo in " + cat);
    var sum = document.getElementById("newtodo_" + cat).value;
    var calendar = CALENDARS.find(cat);
    if (calendar == null){
        console.log("Calendar not found");
        calendar = CALENDARS.calendars[0];
    }
    var t = new Todo(TODO_TEMPLATE, calendar);
    t.uid = guid();
    t.parseICS(t.d, t.datas.split("\n"), 0);
    t.d["VCALENDAR"]["VTODO"]["UID"] = t.uid;
    t.d["VCALENDAR"]["VTODO"]["SUMMARY"] = sum;
    t.d["VCALENDAR"]["VTODO"]["CATEGORIES"] = cat;
    t.encrypted = $("#newtodo_form_encrypted").prop("checked");
    calendar.putTodo(t);

    //TODOFORM.show({summary: sum}, true);
}

function newTodoEvent(event) {

    if (event.which == 13 || event.keyCode == 13) {
        var cat = event.target.id.replace("newtodo_", "");
        newTodo(cat);
    }
}
