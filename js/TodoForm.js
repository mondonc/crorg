// Class
function TodoForm(){

    this.title = document.getElementById("todoFormTitle");
    this.summary = $("#todoFormSummary");
    this.location = $("#todoFormLocation");
    this.calendars = $("#todoFormCalendar");
    this.categories = $("#todoFormCategories");
    this.encrypt = $("#todoFormEncrypt");
    this.uid = "";
    this.parentCalendar = null;

    this.show = function(todo_uid, showModal){

        this.calendars.find('option').remove();
        $.each(CALENDARS.calendars, function (i, cal) {
           TODOFORM.calendars.append($('<option>', {
                value: cal.name,
                text : cal.name
            }));
        });

        this.categories.find('input').remove();
        this.categories.find('label').remove();
        $.each(DASHBOARD.todos, function (i, t) {
           TODOFORM.categories.append(
               $('<input/>', {
                   type: 'radio',
                   id: "radio_" + i,
                   name: "radio_todo",
                   value : i,
               }));
           TODOFORM.categories.append('<label for="radio_' + i + '" >' + i + ' </label> ');
        });

        todo = CALENDARS.getTodo(todo_uid);


            this.title.innerHTML = "Update todo";
            this.uid = todo.uid;
            this.summary.val(todo.d.VCALENDAR.VTODO.SUMMARY);
            this.parentCalendar = todo.calendar;
            this.calendars.val(todo.calendar.name);
            if (todo.encrypted) {
                this.encrypt.prop("checked", true);
            } else {
                this.encrypt.prop("checked", false);
            }
            DELFORM.init(todo, todo.d.VCALENDAR.VTODO.SUMMARY);

        //this.button.click(this.getValues);
        if (showModal) {
            $('#todoForm').modal("show");
        }

    }

    this.getValues = function(){
        var cal = CALENDARS.find(TODOFORM.calendars.val());
        var encrypt = TODOFORM.encrypt.prop("checked");

            var t = this.parentCalendar.getTodo(TODOFORM.uid);
            $("#calendar").fullCalendar( 'removetodos', TODOFORM.uid)
            if (this.parentCalendar != cal) {
                this.parentCalendar.delTodo(t);
                t.calendar = cal;
            }

        t.d["VCALENDAR"]["VTODO"]["SUMMARY"] = TODOFORM.summary.val();
        t.encrypted = encrypt;

        cal.putTodo(t);
        $('#todoForm').modal("hide");
    }

}
