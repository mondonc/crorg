
var CALENDARS = new Calendars();

function refetchIfneeded(){
    //if (ICScpt != ICScpt_last && ICScpt == ICSloaded){
    //    ICScpt_last = ICScpt;
    //    FCEVENTS.push.apply(FCEVENTS, Calendars.zimbra.FCevents);
        //FCEVENTS.push.apply(FCEVENTS, Calendars.boulot.FCevents);
    //    console.log(Calendars.boulot.FCevents);
    //for (cal in CALENDARS.calendars){
    //}
    //  console.log(CALENDARS);
        //$('#calendar').fullCalendar( 'refetchEvents' );
    //}
}


$(document).ready(function() {


    //calendar_init();
    CALENDARS.load(calendar_init);
    setInterval(function(){refetchIfneeded()}, 5000);

});
