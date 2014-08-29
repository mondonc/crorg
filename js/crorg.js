
var CALENDARS = new Calendars();
var EVENTFORM = new EventForm();
var DELFORM = new DelForm();
var LOADINGBAR = new LoadingBar('#loading-bar');
var ENCRYPTBAR = new LoadingBar('#encrypt-bar');
var CRYPTER = new Crypter("toto");
var DASHBOARD = new Dashboard();

var activeNav = "navdashboard";
var today = moment();
var first_day = moment().utc().day(1);
first_day.utc().millisecond(0);
first_day.utc().second(0);
first_day.utc().minute(0);
first_day.utc().hour(0);

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

function refresh(){
    $('#calendar').fullCalendar( 'destroy' )
    CALENDARS = new Calendars();
    //calendar_init();
    LOADINGBAR.resetHard();
    ENCRYPTBAR.resetHard();
    DASHBOARD.clearAll();
    CALENDARS.load();
}

function download2months(){
    for (i=1;i<9;i++) {
        var day = moment().utc().day(1 + (7*i));
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
    CALENDARS.load();
    //CALENDARS.load(calendar_init);
    //setInterval(function(){refetchIfneeded()}, 5000);

});
