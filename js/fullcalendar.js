function calendar_init() {
    var FCCALENDAR = $('#calendar').fullCalendar({

        header: {
            left: '',
            center: '',
            right: '',
        },

        lang: 'fr',
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar !!!
        selectable: true,
        selectHelper: true,
        //eventSources: [],
        //events: [],
        firstDay: 1, // first day is monday
        defaultView: "agendaWeek",
        axisFormat: 'H:mm',
        weekNumbers: true,
        weekNumberTitle: "n°",
        minTime: "07:00:00",
        //slotDuration: '01:00:00',
        slotDuration: '00:30:00',
        allDayText: "",
        //aspectRatio: 2,
        timezone: "local",
        lazyFetching: false,

        //timeFormat: {
        // for agendaWeek and agendaDay
        //agenda: 'H:mm{ - H:mm}',
        // for all other views
        //'': 'H(:mm)'
        //},
        timeFormat: 'H:mm',

        columnFormat: {
            month: 'ddd',
            week: 'ddd D/MM',
            day: 'dddd dd/MM'
        },

        titleFormat: {
            month: 'MMMM yyyy',                             // September 2009
            week: "dd MMM [ yyyy]{ '&#8212;' dd MMM yyyy}", // Sep 7 - 13 2009
            day: 'dddd dd MMM yyyy'                  // Tuesday, Sep 8, 2009
        },

        buttonText: {
            prev:     '&nbsp;&#9668;&nbsp;',  // left triangle
            next:     '&nbsp;&#9658;&nbsp;',  // right triangle
            prevYear: '&nbsp;&lt;&lt;&nbsp;', // <<
            nextYear: '&nbsp;&gt;&gt;&nbsp;', // >>
            today:    'Aujourd\'hui',
            month:    'Mois',
            week:     'Semaine',
            day:      'Journee'
        },

        // French part
        monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'],
        monthNamesShort: ['Jan','Fev','Mar','Avr','Mai','Jui','Jul','Aou','Sep','Oct','Nov','Dec'],
        dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','vendredi','Samedi'],
        dayNamesShort: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],

        select: function(start, end, jsEvent, view) {
            EVENTFORM.show({start: start, end: end, jsEvent: jsEvent}, true);
        },

        eventDrop: function(calEvent, delta) {
            EVENTFORM.show(calEvent, false);
            EVENTFORM.getValues();
        },

        eventClick: function(calEvent, jsEvent, view) {
            EVENTFORM.show(calEvent, true);
            //display_prompt({title: "Event title : ", title_input: calEvent.title, button: "Save", call: event_update, start : calEvent.start, end : calEvent.end, allDay : calEvent.allDay, e : calEvent});
            //var title = window.prompt("Evenement :",calEvent.title);
            return false;
        },

        loading: function(bool) {
            if (bool) $('#loading').show();
            else $('#loading').hide();
        },

        //viewRender: function(view, element) {


        //},

        eventResize: function( event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ) {
            EVENTFORM.show(event, false);
            EVENTFORM.getValues();
        },

    });
}

function removeEvent ( href )
{
    console.log("removeEvent");
    console.log(href);
}

function deletedCalendar (c, r,s)
{
    console.log("calendarDeleted")
    if ( s == 'success' );
    console.log("calendarDeleted success")
}


