var CALENDARS = new Calendars();
var EVENTFORM = new EventForm();
var DELFORM = new DelForm();
var LOADINGBAR = new LoadingBar('#loading-bar');
var ENCRYPTBAR = new LoadingBar('#encrypt-bar');
var CRYPTER = new Crypter("toto");
var DASHBOARD = new Dashboard();

var activeNav = "navdashboard";
console.log();
//moment.locale('fr', {
//    months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
//    monthsShort : "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
//    weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
//    weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
//    weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
//    longDateFormat : {
//        LT : "HH:mm",
//        L : "DD/MM/YYYY",
//        LL : "D MMMM YYYY",
//        LLL : "D MMMM YYYY LT",
//        LLLL : "dddd D MMMM YYYY LT"
//    },
//    calendar : {
//        sameDay: "[Aujourd'hui à] LT",
//        nextDay: '[Demain à] LT',
//        nextWeek: 'dddd [à] LT',
//        lastDay: '[Hier à] LT',
//        lastWeek: 'dddd [dernier à] LT',
//        sameElse: 'L'
//    },
//    relativeTime : {
//        future : "dans %s",
//        past : "il y a %s",
//        s : "quelques secondes",
//        m : "une minute",
//        mm : "%d minutes",
//        h : "une heure",
//        hh : "%d heures",
//        d : "un jour",
//        dd : "%d jours",
//        M : "un mois",
//        MM : "%d mois",
//        y : "une année",
//        yy : "%d années"
//    },
//    ordinal : function (number) {
//        return number + (number === 1 ? 'er' : 'ème');
//    },
//    week : {
//        dow : 1, // Monday is the first day of the week.
//        doy : 4  // The week that contains Jan 4th is the first week of the year.
//    }
//});
moment.locale('fr');
//var today = moment().startOf('day');
var today = moment.utc(moment().format('YYYY-MM-DD')).startOf('day');
var tomorow = moment(today).add(1, 'day');
var first_day = moment(today).day(1);
//console.log(today);
//console.log(tomorow);

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
