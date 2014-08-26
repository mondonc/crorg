
function LoadingBar(el){

    this.lb = $(el);
    this.total = 0;
    this.cpt = 0;

    this.setTotal = function (value) {
        this.total = value;
    }

    this.incr = function () {
        this.cpt++;
        if (this.cpt == this.total) {
            this.end()
        } else {
            this.set( (100 / this.total) * this.cpt);
        }
    }

    this.end = function() {
            this.set(100);
            this.total = 0;
            this.cpt = 0;
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
        this.total = 0;
        this.cpt = 0;
    }
}
