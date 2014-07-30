
var CALENDARS = new Calendars();
var EVENTFORM = new EventForm();
var DELFORM = new DelForm();
var activeNav = "navdashboard";

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

function changeView(id){
        var contentId = id.replace(/^nav/, '');
        var contentActiveNav = activeNav.replace(/^nav/, '');
        document.getElementById(activeNav).classList.remove("active");
        document.getElementById(contentActiveNav).style.display = 'none';
        document.getElementById(id).classList.add("active");
        document.getElementById(contentId).style.display = 'block';
        activeNav = id;
        if (contentId == "calendar") {
            //if (document.getElementById(contentId).innerHTML) {
                //calendar_init();
                $('#calendar').fullCalendar('render');
            //}
        }
}

function refresh(){}
function exit(){}


$(document).ready(function() {


    //calendar_init();
    CALENDARS.load(calendar_init);
    //CALENDARS.load();
    //setInterval(function(){refetchIfneeded()}, 5000);

});
