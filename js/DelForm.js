// Class
function DelForm(){

    this.event = null;

    this.init = function(event){
        document.getElementById("delFormButton").style.display = 'block';
        document.getElementById("delFormBody").innerHTML = 'Are you sure you want to delete Event «' + event.title + '» ?';
        this.event = event;
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
        var e = DELFORM.event.calendar.getEvent(DELFORM.event.id);
        DELFORM.event.calendar.delEvent(e);
        $("#calendar").fullCalendar( 'removeEvents', e.uid)
    }
}
