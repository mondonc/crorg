KNOWN_TODO = {
    "Familly" : {
        element: document.getElementById("dashboard_todo_Familly"),
        msg: document.getElementById("dashboard_todo_Familly_msg"),
    },
    "Work" : {
        element: document.getElementById("dashboard_todo_Work"),
        msg:document.getElementById("dashboard_todo_Work_msg"),
    },
    "Personal" : {
        element: document.getElementById("dashboard_todo_Personal"),
        msg:document.getElementById("dashboard_todo_Personal_msg"),
    },
    "Other" : {
        element: document.getElementById("dashboard_todo_Other"),
        msg:document.getElementById("dashboard_todo_Other_msg"),
    },
};

function Dashboard() {

    this.todayEvents = [];
    this.todos = {};
    this.tomorowEvents = [];
    this.todayEl = document.getElementById("dashboard_today");
    this.tomorowEl = document.getElementById("dashboard_tomorow");
    this.todayMsg = document.getElementById("dashboard_today_msg");
    this.tomorowMsg = document.getElementById("dashboard_tomorow_msg");
    this.todoEl = document.getElementById("dashboard_todo");
    this.todoMsg = document.getElementById("dashboard_todo_msg");

    for (cat in KNOWN_TODO) { this.todos[cat] = []; }

    this._push = function(l, e) {
        l.push(e);
    }

    this._sort = function (l) {
        l.sort(function(a, b) {
            return a.getMomentStart() - b.getMomentStart();
        })
    }

    this.pushEvent = function(event) {
        this.eventDeleteIfExist(event);
        if (event.isToday()) {
            this._push(this.todayEvents, event);
            this.refreshToday();
        } else if (event.isTomorow()) {
            this._push(this.tomorowEvents, event);
            this.refreshTomorow();
        }
    }

    this.eventDeleteIfExist = function (event) {
        var idx = $.inArray(event, this.todayEvents);
        if (idx >= 0) {
            console.log("Found !!");
            this.todayEvents.splice(idx, 1);
            this.refreshToday();
        }
        var idx = $.inArray(event, this.tomorowEvents);
        if (idx >= 0) {
            console.log("Found !!");
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
        var categories = todo.d.VCALENDAR.VTODO.CATEGORIES;
        if (KNOWN_TODO.hasOwnProperty(categories)) {
            this.todos[categories].push(todo);
        } else {
            this.todos["Other"].push(todo);
        }
        this.refreshTodo();
    }

    this.refreshTodo = function () {

        // Clear
        for (cat in this.todos) {
            KNOWN_TODO[cat]["element"].innerHTML = "";
            KNOWN_TODO[cat]["msg"].innerHTML = "";
        }

        for (cat in this.todos) {
            if (this.todos[cat].length == 0) {
                KNOWN_TODO[cat]["msg"].innerHTML = "Nothing to do, yeah !";
            } else {
                for (todo in this.todos[cat]) {
                    KNOWN_TODO[cat]["element"].innerHTML += this.todos[cat][todo].getTableLine();
                }
            }
        }
    }

    this._refresh = function (el, m, l) {

        el.innerHTML = "";
        m.innerHTML = "";
        this._sort(l);
        if (l.length == 0) {
            m.innerHTML = "Nothing to do, yeah !";
        } else {
            for (i in l) {
                el.innerHTML += l[i].getTableLine();
            }
        }

    }

    this.refreshToday = function () {
        this._refresh(this.todayEl, this.todayMsg, this.todayEvents);
    }

    this.refreshTomorow = function () {
        this._refresh(this.tomorowEl, this.tomorowMsg, this.tomorowEvents);
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
