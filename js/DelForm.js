// Class
function DelForm(){

    this.event = null;

    this.init = function(obj, summary){
        document.getElementById("delFormButton").style.display = 'block';
        document.getElementById("delFormBody").innerHTML = 'Are you sure you want to delete «' + summary + '» ?';
        this.obj = obj;
    }
    this.hideButton = function(){
        document.getElementById("delFormButton").style.display = 'none';
    }
    this.show = function(){

        //$('#EventForm').modal("hide");
        $('#delForm').modal("show");
    }

    this.confirm = function(){

        $('#delForm').modal("hide");
        //var e = DELFORM.event.calendar.getEvent(DELFORM.obj.uid);

        if (this.obj.d.VCALENDAR.hasOwnProperty("VTODO")) {
            DELFORM.obj.calendar.delTodo(DELFORM.obj);
            DASHBOARD.todoDeleteIfExist(DELFORM.obj);
            DASHBOARD.refreshTodo();
        } else {
            DELFORM.obj.calendar.delEvent(DELFORM.obj);
            DASHBOARD.eventDeleteIfExist(DELFORM.obj);
            $("#calendar").fullCalendar( 'removeEvents', DELFORM.obj.uid)
            DASHBOARD.refreshToday();
            DASHBOARD.refreshTomorow();
        }
    }
}
