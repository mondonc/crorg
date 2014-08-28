function Dashboard() {

    this.todayEvents = [];
    this.tomorowEvents = [];
    this.todayEl = document.getElementById("dashboard_today");
    this.tomorowEl = document.getElementById("dashboard_tomorow");
    this.todayMsg = document.getElementById("dashboard_today_msg");
    this.tomorowMsg = document.getElementById("dashboard_tomorow_msg");


    this._push = function(l, e) {
        l.push(e);
    }

    this._sort = function (l) {
        l.sort(function(a, b) {
            return a.getMomentStart() - b.getMomentStart();
        })
    }

    this.pushToday = function (event) {
        this._push(this.todayEvents, event);
        this.refreshToday();
    }

    this.pushTomorow = function (event) {
        this._push(this.tomorowEvents, event);
        this.refreshTomorow();
    }

    this._refresh = function (el, m, l) {

        el.innerHTML = "";
        m.innerHTML = "";
        this._sort(l);
        if (l.length == 0) {
            m.innerHTML = "Nothing to do, yeah !";
        } else {
            console.log(l);
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





}
