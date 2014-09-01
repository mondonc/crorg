
function LoadingBar(el){

    this.lb = $(el);
    this.total = {};
    this.len = 0;
    this.nbempty = 0;
    this.cpt = {};

    this.setTotal = function (cal, value) {
        this.total[cal] = value;
    }

    this.addTotal = function (cal, value) {
        this.total[cal] += value;
    }

    this.empty = function (cal, value) {
        this.nbempty++;
        if (this.nbempty == this.len)
            this.end();
    }


    this.registre = function(name) {
        this.total[name] = 0;
        this.cpt[name] = 0;
        this.len += 1;

    }

    this.incr = function (cal) {
        //console.log("Incr de " + cal + " (" + this.cpt[cal] + " / " + (this.total[cal]) + ")");
        this.cpt[cal]++;
        var total = 0;
        for (cal in this.cpt) {
            if (this.total[cal] > 0){
                part = ( (100 / this.len) / (this.total[cal])) * this.cpt[cal];
                //console.log(this.lb.selector + " : " + cal + " : " + part + "%");
                total += part;
            } else {
                total += (100 / this.len);
            }
            //console.log(this.lb.selector + " : " + cal + " (global) : " + total + "%");
            //console.log(this.lb.selector + " : " + cal + " (total in cal): " + this.total[cal]);
            //console.log(this.lb.selector + " : " + cal + " (cpt in cal): " + this.cpt[cal]);
        }
        if (total == 100) {
            for (k in this.total) this.total[k] = 0;
            for (k in this.cpt) this.cpt[k] = 0;
        }
        this.set(total);
    }

    this.end = function() {
            //console.log(this.lb.selector + " :  END !");
            this.set(100);
            this.lb.attr('class', 'progress-bar progress-bar-success');
    }

    this.set = function (value){
        if (value < 100)
            this.lb.attr('class', 'progress-bar progress-bar-danger');
        else
            this.lb.attr('class', 'progress-bar progress-bar-success');

        this.lb.css('width', value);
    }

    this.reset = function (){
        //this.lb.animate({ width: "0%" },0);
        this.set(0);
        this.nbempty = 0;
        //for (k in this.total) this.total[k] = 0;
        //for (k in this.cpt) this.cpt[k] = 0;
    }

    this.resetHard = function () {
        this.reset();
        this.total = {};
        this.len = 0;
        this.nbempty = 0;
        this.cpt = {};
    }
}
