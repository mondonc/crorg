
function LoadingBar(){

    this.lb = $('#loading-bar')
    this.total = 0;
    this.cpt = 0;

    this.setTotal = function (value) {
        LOADINGBAR.total = value;
    }

    this.incr = function () {
        LOADINGBAR.cpt++;
        if (LOADINGBAR.cpt == LOADINGBAR.total) {
            LOADINGBAR.end()
        } else {
            LOADINGBAR.set( (100 / LOADINGBAR.total) * LOADINGBAR.cpt);
        }
    }

    this.end = function() {
            LOADINGBAR.set(100);
            LOADINGBAR.lb.attr('class', 'progress-bar progress-bar-success');
            LOADINGBAR.total = 0;
            LOADINGBAR.cpt = 0;
    }

    this.set = function (value){
        LOADINGBAR.lb.css('width', value);
    }

    this.reset = function (){
        //LOADINGBAR.lb.animate({ width: "0%" },0);
        LOADINGBAR.set(0);
        LOADINGBAR.lb.attr('class', 'progress-bar progress-bar-danger');
        LOADINGBAR.total = 0;
        LOADINGBAR.cpt = 0;
    }
}
