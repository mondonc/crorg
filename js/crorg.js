
var CALENDARS = new Calendars();
var EVENTFORM = new EventForm();
var DELFORM = new DelForm();
var LOADINGBAR = new LoadingBar('#loading-bar');
var ENCRYPTBAR = new LoadingBar('#encrypt-bar');
var CRYPTER = new Crypter("toto");

var activeNav = "navdashboard";
var first_day = moment().day(1);
first_day.millisecond(0);
first_day.second(0);
first_day.minute(0);
first_day.hour(0);

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
function download2months(){
    for (i=1;i<9;i++) {
        var day = moment().day(1 + (7*i));
        day.utc().millisecond(0);
        day.utc().second(0);
        day.utc().minute(0);
        day.utc().hour(0);
        CALENDARS.loadAllCalendars(day, true);
    }


}

function exit(){}


$(document).ready(function() {


    //calendar_init();
    calendar_init();
    //CALENDARS.load(calendar_init);
    CALENDARS.load();
    //setInterval(function(){refetchIfneeded()}, 5000);

});
