

function Dashboard() {

    this.todayEvents = [];
    this.todos = {
        'Work' : [],
        'Familly' : [],
        'Personal' : [],
    };
    this.tomorowEvents = [];
    this.todayEl = document.getElementById("dashboard_today");
    this.tomorowEl = document.getElementById("dashboard_tomorow");
    this.todayMsg = document.getElementById("dashboard_today_msg");
    this.tomorowMsg = document.getElementById("dashboard_tomorow_msg");
    this.todoEl = document.getElementById("dashboard_todo");
    this.todoMsg = document.getElementById("dashboard_todo_msg");

    //for (cat in KNOWN_TODO) { this.todos[cat] = []; }

    this._push = function(l, e) {
        l.push(e);
    }

    this._sort_event = function (l) {
        l.sort(function(a, b) {
            return a.getMomentStart() - b.getMomentStart();
        })
    }

    this._sort_todo = function (l) {
        l.sort(function(a, b) {
            return parseInt(a.d.VCALENDAR.VTODO["PERCENT-COMPLETE"], 10) - parseInt(b.d.VCALENDAR.VTODO["PERCENT-COMPLETE"], 10);
        })
    }

    this.pushEvent = function(event) {
        this.eventDeleteIfExist(event);
        if (event.isToday()) {
            this._push(this.todayEvents, event);
            this.refreshToday();
        }
        if (event.isTomorow()) {
            this._push(this.tomorowEvents, event);
            this.refreshTomorow();
        }
    }

    this.eventDeleteIfExist = function (event) {
        var idx = eventInList(event, this.todayEvents);
        if (idx >= 0) {
            this.todayEvents.splice(idx, 1);
            this.refreshToday();
        }
        var idx = eventInList(event, this.tomorowEvents);
        if (idx >= 0) {
            this.tomorowEvents.splice(idx, 1);
            this.refreshTomorow();
        }
    }

    this.todoDeleteIfExist = function (todo) {
        for (cat in this.todos) {
            var idx = $.inArray(todo, this.todos[cat]);
            if (idx >= 0) {
                this.todos[cat].splice(idx, 1);
            }
        }
    }

    this.pushTodo = function (todo) {
        this.todoDeleteIfExist(todo);
        if (todo.d.VCALENDAR.VTODO.CATEGORIES == undefined) todo.d.VCALENDAR.VTODO.CATEGORIES = "Other";

        var categories = todo.d.VCALENDAR.VTODO.CATEGORIES;
        if (!this.todos.hasOwnProperty(categories)) {
            this.todos[categories] = [];
        } //else {
        this.todos[categories].push(todo);
        //    this.todos["Other"].push(todo);
        //}
        this.refreshTodo();
    }

    this.refreshTodo = function () {

        // Clear
        document.getElementById("todos_0").innerHTML = "";
        document.getElementById("todos_1").innerHTML = "";
        //for (cat in this.todos) {
            //KNOWN_TODO[cat]["element"].innerHTML = "";
            //KNOWN_TODO[cat]["msg"].innerHTML = "";
        //}

        var cpt = 0;
        for (cat in this.todos) {

            var todo_class = "default";
            var todo_icon = "th-list";
            var begin = -1;
            if (cat == "Familly") {
                todo_class = "danger";
                todo_icon = "heart";
                begin = 0;
            } else if (cat == "Work") {
                todo_class = "warning";
                todo_icon = "euro";
                begin = 1;
            } else if (cat == "Personal") {
                todo_class = "success";
                todo_icon = "user";
                begin = 1;
            }

            var options = "";
            $.each(CALENDARS.calendars, function (i, cal) {
               options += '<option value="' + cal.name + '">' + cal.name + '</option>';
            });

            var input_group = '<form class="form-inline" role="form">' +
                ' <label id="newtodo_form_encrypted_label" class="pull-right "> <input id="newtodo_form_encrypted" class="pull-right" type="checkbox"/> <span class="glyphicon glyphicon-lock"></span></label>' +
                '<span class="input-group pull-right col-md-7">' +
                    '<input id="newtodo_' + cat + '" type="text" class="form-control" placeholder="New" onkeyup="newTodoEvent(event)" />' +
                    '<span class="input-group-btn">' +
                        ' <button class="btn btn-default" type="button" onclick="newTodo(\'' + cat + '\')">' +
                            '<span class="glyphicon glyphicon-floppy-saved"></span>' +
                        '</button> ' +
                    '</span> ' +
                '</span> ' +
                '</form>';
            var content = '<div id="todo_' + cat + '" class="panel panel-' + todo_class + '">' +
              '<div class="panel-heading">' +
                '<span class="panel-title"><span class="pull-left"><span class="glyphicon glyphicon-' + todo_icon + '"></span> ' + cat + '</span>' + input_group +
                '<span class="clearfix">' +
              '</div>' +
              '<span class="" id="todo_' + cat + '_msg"></span>' +
              '<table class="table table-hover" id="todo_' + cat + '_table">' +
              '</table>' +
            '</div>'

            if (begin == 0) {
                var old_content = document.getElementById("todos_0").innerHTML;
                document.getElementById("todos_0").innerHTML = content;
                document.getElementById("todos_0").innerHTML += old_content;
                cpt = 0;
            } else if (begin == 1){
                var old_content = document.getElementById("todos_1").innerHTML;
                document.getElementById("todos_1").innerHTML = content;
                document.getElementById("todos_1").innerHTML += old_content;
                cpt = 1;
            } else {
                var key = "todos_" + cpt%2;
                document.getElementById(key).innerHTML += content;
            }

//            console.log("Installing keyup for " + cat);
//            console.log('#newtodo_' + cat);
//            $('#newtodo_' + cat).on('keyup', function(e) {
//                console.log("Key pressed " + cat);
//                if (e.which == 13) {
//                    newTodo(e.target.id.replace("newtodo_", ""));
//                    e.preventDefault();
//                }
//            });
            cpt++;

            //for (todo in this.todos[cat]) {
                //document.getElementById("todo_" + cat + "_table").innerHTML += this.todos[cat][todo].getTableLine();
            this._refresh(document.getElementById("todo_" + cat + "_table"), document.getElementById("todo_" + cat + "_msg"), this.todos[cat], null, this._sort_todo);
            //}
            //if (this.todos[cat].length == 0) {
            //    KNOWN_TODO[cat]["msg"].innerHTML = "Nothing to do, yeah !";
            //} else {
            //}
        }
    }

    this._refresh = function (el, m, l, reference, sort_fct) {

        el.innerHTML = "";
        m.innerHTML = "";
        sort_fct(l);
        if (l.length == 0) {
            m.innerHTML = "Nothing to do, yeah !";
        } else {
            for (i in l) {
                el.innerHTML += l[i].getTableLine(reference);
            }
        }

    }

    this.refreshToday = function () {
        this._refresh(this.todayEl, this.todayMsg, this.todayEvents, today, this._sort_event);
    }

    this.refreshTomorow = function () {
        this._refresh(this.tomorowEl, this.tomorowMsg, this.tomorowEvents, tomorow, this._sort_event);
    }

    this.clearAll = function () {

        for (cat in KNOWN_TODO) {
            KNOWN_TODO[cat]["element"].innerHTML = "";
            KNOWN_TODO[cat]["msg"].innerHTML = "";
        }
        this.todayEl.innerHTML = "";
        this.todayMsg.innerHTML = "";
        this.tomorowEl.innerHTML = "";
        this.tomorowMsg.innerHTML = "";
        for (cat in KNOWN_TODO) { this.todos[cat] = []; }
        this.todayEvents = [];
        this.tomorowEvents = [];
    }





}
