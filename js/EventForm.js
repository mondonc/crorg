// Class
function EventForm(){

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
    this.calendar = $("#eventFormCalendar");
    this.allday = $("#eventFormAllDay");

    this.start.datetimepicker({
        format:'d/m/Y',
        timepicker:false,
    });

    this.end.datetimepicker({
        format:'d/m/Y',
        timepicker:false,
    });

//    var now = moment( ).subtract( "seconds", 1 );
//    this.start.filthypillow( {
//      minDateTime: function( ) {
    //        return now;
    //      },
    //      saveOnDateSelect: true,
    //    } );
    //    this.start.on( "focus", (function( ) {
    //      this.start.filthypillow( "show" );
    //    }).bind(this) );
    //    this.start.on( "eventFormStart:save", (function( e, dateObj ) {
    //      this.start.val( dateObj.format( "MMM DD YYYY hh:mm A" ) );
    //      this.start.filthypillow( "hide" );
    //    }).bind(this) );

    this.show = function(event){

        this.start.val(event.start.format("DD/MM/YYYY"));
        this.startHour.val(event.start.format("HH"));
        this.startMinute.val(event.start.format("mm"));
        this.end.val(event.end.format("DD/MM/YYYY"));
        this.endHour.val(event.end.format("HH"));
        this.endMinute.val(event.end.format("mm"));

        // If allday event
        if (!event.start.hasTime()){
            this.allday.prop("checked", true);
        } else {
            this.allday.prop("checked", false);
        }

        // New event
        if (!event.hasOwnProperty("uid")){

            this.title = "Add new event";
            this.uid = "";
            this.end.value = event.end;

        // Existing Event
        } else {

            this.title = "Update event";
            this.uid = event.uid;

        }

        this.calendar.find('option').remove();
        $.each(CALENDARS.calendars, function (i, cal) {
           EVENTFORM.calendar.append($('<option>', {
                value: cal.name,
                text : cal.name
            }));
        });

        this.button.click(this.getValues);
        $('#eventForm').modal("show");
    }

    this.getValues = function(){
        console.log(EVENTFORM.summary);
        if (EVENTFORM.uid){

        // New Event
        } else {
            var e = new Event(EVENT_TEMPLATE);
            e.uid = guid();
            e.d["VCALENDAR"]["VEVENT"]["UID"] = e.uid;
            e.d["VCALENDAR"]["VEVENT"]["SUMMARY"] = EVENTFORM.summary.val();
            e.d["VCALENDAR"]["VEVENT"]["DESCRIPTION"] = EVENTFORM.description.val();
            e.d["VCALENDAR"]["VEVENT"]["LOCATION"] = EVENTFORM.location.val();

            var startparts = EVENTFORM.start.val().split("/");
            var endparts = EVENTFORM.end.val().split("/");
            var startdate = new Date(startparts[2], startparts[1] - 1, startparts[0]);
            var enddate = new Date(endparts[2], endparts[1] - 1, endparts[0]);
            if (EVENTFORM.allday.prop("checked")){
                e.d["VCALENDAR"]["VEVENT"]["DTSTART;VALUE=DATE"] = startdate.format("YYYYMMDD");
                delete e.d["VCALENDAR"]["VEVENT"]["DTSTART"];
                e.d["VCALENDAR"]["VEVENT"]["DTEND;VALUE=DATE"] = enddate.format("YYYYMMDD");
                delete e.d["VCALENDAR"]["VEVENT"]["DTEND"]
            } else {
                startdate.setHours(EVENTFORM.startHour.val());
                startdate.setMinutes(EVENTFORM.startMinute.val());
                e.d["VCALENDAR"]["VEVENT"]["DTSTART"] = formatDate(startdate);
                enddate.setHours(EVENTFORM.endHour.val());
                enddate.setMinutes(EVENTFORM.endMinute.val());
                e.d["VCALENDAR"]["VEVENT"]["DTEND"] = formatDate(enddate);
            }
            console.log(startdate);
            console.log(enddate);
            console.log(e.getICS());
        }

        CALENDARS.find(EVENTFORM.calendar.val()).putEvent(e);
        $('#eventForm').modal("hide");
        //CALENDARS.calendars[0].putEvent(CALENDARS.calendars[0].href, e);


        console.log("Fin");

    }

}
