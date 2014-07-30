// Class
function EventForm(){

    this.dateFormat = "DD/MM/YYYY"

    this.title = document.getElementById("eventFormTitle");
    this.summary = $("#eventFormSummary");
    this.description = $("#eventFormDescription");
    this.location = $("#eventFormLocation");
    this.button = $("#eventFormButton");
    this.start = $("#eventFormStart");
    this.startHour = $("#eventFormStartHour");
    this.startMinute = $("#eventFormStartMinute");
    this.end = $("#eventFormEnd");
    this.endHour = $("#eventFormEndHour");
    this.endMinute = $("#eventFormEndMinute");
    this.calendars = $("#eventFormCalendar");
    this.allday = $("#eventFormAllDay");
    this.uid = "";
    this.parentCalendar = null;

    this.start.datetimepicker({
        format:'d/m/Y',
        timepicker:false,
    });

    this.end.datetimepicker({
        format:'d/m/Y',
        timepicker:false,
    });

    this.show = function(event){

        this.start.val(event.start.format(this.dateFormat));
        this.startHour.val(event.start.format("HH"));
        this.startMinute.val(event.start.format("mm"));
        this.end.val(event.end.format(this.dateFormat));
        this.endHour.val(event.end.format("HH"));
        this.endMinute.val(event.end.format("mm"));

        // If allday event
        if (!event.start.hasTime()){
            console.log("ALLDAY");
            this.allday.prop("checked", true);
        } else {
            this.allday.prop("checked", false);
        }

        this.calendars.find('option').remove();
        $.each(CALENDARS.calendars, function (i, cal) {
           EVENTFORM.calendars.append($('<option>', {
                value: cal.name,
                text : cal.name
            }));
        });

        console.log(event);
        // New event
        if (!event.hasOwnProperty("id")){

            this.title.innerHTML = "Add new event";
            this.uid = "";
            this.summary.val("");
            this.description.val("");
            this.location.val("");
            DELFORM.hideButton();

        // Existing Event
        } else {

            console.log("existing");
            this.title.innerHTML = "Update event";
            this.uid = event.id;
            this.summary.val(event.title);
            this.description.val(event.description);
            this.location.val(event.location);
            this.parentCalendar = event.calendar;
            this.calendars.val(event.calendar.name);
            DELFORM.init(event);
        }

        //this.button.click(this.getValues);
        $('#eventForm').modal("show");

    }

    this.getValues = function(){
        var cal = CALENDARS.find(EVENTFORM.calendars.val());
        if (EVENTFORM.uid){
            var e = this.parentCalendar.getEvent(EVENTFORM.uid);
            $("#calendar").fullCalendar( 'removeEvents', EVENTFORM.uid)
            if (this.parentCalendar != cal) {
                this.parentCalendar.delEvent(e);
                e.calendar = cal;
            }

        // New Event
        } else {
            var e = new Event(EVENT_TEMPLATE, cal);
            e.uid = guid();
            e.d["VCALENDAR"]["VEVENT"]["UID"] = e.uid;
        }

        e.d["VCALENDAR"]["VEVENT"]["SUMMARY"] = EVENTFORM.summary.val();
        e.d["VCALENDAR"]["VEVENT"]["DESCRIPTION"] = EVENTFORM.description.val();
        e.d["VCALENDAR"]["VEVENT"]["LOCATION"] = EVENTFORM.location.val();

        var startdate = new moment(EVENTFORM.start.val(), EVENTFORM.dateFormat);
        var enddate = new moment(EVENTFORM.end.val(), EVENTFORM.dateFormat);

        if (EVENTFORM.allday.prop("checked")){
            console.log(startdate);
            e.d["VCALENDAR"]["VEVENT"]["DTSTART;VALUE=DATE"] = startdate.format("YYYYMMDD");
            delete e.d["VCALENDAR"]["VEVENT"]["DTSTART"];
            e.d["VCALENDAR"]["VEVENT"]["DTEND;VALUE=DATE"] = enddate.format("YYYYMMDD");
            delete e.d["VCALENDAR"]["VEVENT"]["DTEND"];
        } else {
            startdate.hour(EVENTFORM.startHour.val());
            startdate.minute(EVENTFORM.startMinute.val());
            e.d["VCALENDAR"]["VEVENT"]["DTSTART"] = formatDate(startdate);
            enddate.hour(EVENTFORM.endHour.val());
            enddate.minute(EVENTFORM.endMinute.val());
            e.d["VCALENDAR"]["VEVENT"]["DTEND"] = formatDate(enddate);
        }
        console.log(e.getICS());


        cal.putEvent(e);
        $('#eventForm').modal("hide");
        $("#calendar").fullCalendar( 'renderEvent', e.getFC())
    }

}
