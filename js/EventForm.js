// Class
function EventForm(){

    this.dateFormat = "DD/MM/YYYY";

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
    this.encrypt = $("#eventFormEncrypt");
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

    this.show = function(event, showModal){

        this.start.val(event.start.format(this.dateFormat));
        this.startHour.val(event.start.format("HH"));
        this.startMinute.val(event.start.format("mm"));

        if (event.hasOwnProperty("end") && event.end != null) {
            this.end.val(event.end.format(this.dateFormat));
            this.endHour.val(event.end.format("HH"));
            this.endMinute.val(event.end.format("mm"));
        } else {
            this.end.val("NOEND");
            this.endHour.val("NOEND");
            this.endMinute.val("NOEND");
        }

        // If allday event
        if (!event.start.hasTime()){
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

            this.title.innerHTML = "Update event";
            this.uid = event.id;
            this.summary.val(event.title);
            this.description.val(event.description);
            this.location.val(event.location);
            this.parentCalendar = event.calendar;
            this.calendars.val(event.calendar.name);
            if (event.encrypted) {
                this.encrypt.prop("checked", true);
            } else {
                this.encrypt.prop("checked", false);
            }
            DELFORM.init(event);
        }

        //this.button.click(this.getValues);
        if (showModal) {
            $('#eventForm').modal("show");
        }

    }

    this.getValues = function(){
        var cal = CALENDARS.find(EVENTFORM.calendars.val());
        var allday = EVENTFORM.allday.prop("checked");
        var encrypt = EVENTFORM.encrypt.prop("checked");
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
            e.parseICS(e.d, e.datas.split("\n"), 0);
            e.d["VCALENDAR"]["VEVENT"]["UID"] = e.uid;
        }

        e.d["VCALENDAR"]["VEVENT"]["SUMMARY"] = EVENTFORM.summary.val();
        console.log("Lu depuis le FORM : " + EVENTFORM.summary.val());
        e.d["VCALENDAR"]["VEVENT"]["DESCRIPTION"] = EVENTFORM.description.val();
        e.d["VCALENDAR"]["VEVENT"]["LOCATION"] = EVENTFORM.location.val();

        var startdate = new moment(EVENTFORM.start.val(), EVENTFORM.dateFormat);
        startdate.hours(EVENTFORM.startHour.val());
        startdate.minutes(EVENTFORM.startMinute.val());

        if (EVENTFORM.end.val() == "NOEND") {
            var enddate = null;
        } else {
            var enddate = new moment(EVENTFORM.end.val(), EVENTFORM.dateFormat);
            enddate.hours(EVENTFORM.endHour.val());
            enddate.minutes(EVENTFORM.endMinute.val());
        }

        e.updateDTSTART(startdate, allday);
        e.updateDTEND(enddate, allday);
        e.encrypted = encrypt;


        cal.putEvent(e);
        $('#eventForm').modal("hide");
        $("#calendar").fullCalendar( 'renderEvent', e.getFC())
    }

}
