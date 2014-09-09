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

    this.show = function(todo, showModal){

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
                   type: 'checkbox',
                   id: "checkbox_" + i,
                   value : i,
               }));
           TODOFORM.categories.append(
               '<label for="checkbox' + i + '" >' + i + ' </label> ');
        });

        // New todo
        if (!todo.hasOwnProperty("uid")){

            this.title.innerHTML = "Add new todo";
            this.uid = "";
            this.summary.val(todo.summary);
            this.location.val("");

        // Existing todo
        } else {

            this.title.innerHTML = "Update todo";
            this.uid = todo.uid;
            this.summary.val(todo.title);
            this.location.val(todo.location);
            this.parentCalendar = todo.calendar;
            this.calendars.val(todo.calendar.name);
            if (todo.encrypted) {
                this.encrypt.prop("checked", true);
            } else {
                this.encrypt.prop("checked", false);
            }
        }

        //this.button.click(this.getValues);
        if (showModal) {
            $('#todoForm').modal("show");
        }

    }

    this.getValues = function(){
        var cal = CALENDARS.find(TODOFORM.calendars.val());
        var encrypt = TODOFORM.encrypt.prop("checked");

        if (TODOFORM.uid){
            var e = this.parentCalendar.gettodo(TODOFORM.uid);
            $("#calendar").fullCalendar( 'removetodos', TODOFORM.uid)
            if (this.parentCalendar != cal) {
                this.parentCalendar.deltodo(e);
                e.calendar = cal;
            }

        // New todo
        } else {
            var t = new Todo(TODO_TEMPLATE, cal);
            t.uid = guid();
            t.parseICS(t.d, t.datas.split("\n"), 0);
            t.d["VCALENDAR"]["VTODO"]["UID"] = t.uid;
        }

        t.d["VCALENDAR"]["VTODO"]["SUMMARY"] = TODOFORM.summary.val();
        t.d["VCALENDAR"]["VTODO"]["LOCATION"] = TODOFORM.location.val();
        t.encrypted = encrypt;

        cal.putTodo(t);
        $('#todoForm').modal("hide");
    }

}
