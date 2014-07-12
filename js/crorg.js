function refetchIfneeded(){
    if (ICScpt != ICScpt_last && ICScpt == ICSloaded){
        ICScpt_last = ICScpt;
        FCEVENTS.push.apply(FCEVENTS, Calendars.zimbra.FCevents);
        //FCEVENTS.push.apply(FCEVENTS, Calendars.boulot.FCevents);
        console.log(Calendars.boulot.FCevents);
        $('#calendar').fullCalendar( 'refetchEvents' );
    }
}
$(document).ready(function() {


    FCEVENTS = [];
    calendar_init();
    setInterval(function(){refetchIfneeded()}, 5000);
    calendarList = [];
    getCalendarData(CALDAV_URL, function (r) {
        $(r.responseXML).find('response').each(function(index, element){
            if ($(element).find("calendar").length >= 1){
                calendarList.push($(element).find("href").text());
            }
        });
        loadcalendars(calendarList);
    });

});
