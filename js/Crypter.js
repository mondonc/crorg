// Crypter class
function Crypter(password) {

    this.password = password;

    this.encrypt = function(event, callback, type) {

        event.d.VCALENDAR.PRODID = "-//CRORG//V0.1//EN";
        var sum = event.d.VCALENDAR[type].SUMMARY;
        var loc = event.d.VCALENDAR[type].LOCATION;
        var des = event.d.VCALENDAR[type].DESCRIPTION;

        triplesec.encrypt ({

            data: new triplesec.Buffer(event.d.VCALENDAR[type].SUMMARY),
            key: new triplesec.Buffer(CRYPTER.password),
            //progress_hook: function (obj) { console.log(obj); }
        }, function(err, buff) {
            ENCRYPTBAR.incr(event.calendar.name);
            if (! err) {
                event.d.VCALENDAR[type].SUMMARY = buff.toString('hex');

                if (type == "VTODO") {
                    event.content = event._getICS(event.d);
                    event.d.VCALENDAR[type].SUMMARY = sum;
                    callback(event);
                    return event;
                }

                triplesec.encrypt ({

                    data: new triplesec.Buffer(event.d.VCALENDAR[type].DESCRIPTION),
                    key: new triplesec.Buffer(CRYPTER.password),
                    //progress_hook: function (obj) { /* ... */ }
                }, function(err, buff) {
                    ENCRYPTBAR.incr(event.calendar.name);
                    if (! err) {
                        event.d.VCALENDAR[type].DESCRIPTION = buff.toString('hex');
                        triplesec.encrypt ({

                            data: new triplesec.Buffer(event.d.VCALENDAR[type].LOCATION),
                            key: new triplesec.Buffer(CRYPTER.password),
                            //progress_hook: function (obj) { /* ... */ }
                        }, function(err, buff) {
                            ENCRYPTBAR.incr(event.calendar.name);
                            if (! err) {
                                event.d.VCALENDAR[type].LOCATION = buff.toString('hex');
                                event.content = event._getICS(event.d);
                                event.d.VCALENDAR[type].LOCATION = loc;
                                event.d.VCALENDAR[type].DESCRIPTION = des;
                                event.d.VCALENDAR[type].SUMMARY = sum;
                                callback(event);
                            }
                        });
                    }
                });
            }
        });
    }

    this.decrypt = function(event, callback, type) {

        triplesec.decrypt ({

            data: new triplesec.Buffer(event.d.VCALENDAR[type].SUMMARY, "hex"),
            key: new triplesec.Buffer(CRYPTER.password),
            //progress_hook: function (obj) { /* ... */ }
            //progress_hook: function (obj) { console.log(obj); }
        }, function(err, buff) {
            ENCRYPTBAR.incr(event.calendar.name);
            if (! err) {
                event.d.VCALENDAR[type].SUMMARY = buff.toString();

                if (type == "VTODO") {
                    event.content = event._getICS(event.d);
                    callback(event);
                    return event;
                }

                triplesec.decrypt ({

                    data: new triplesec.Buffer(event.d.VCALENDAR[type].DESCRIPTION, "hex"),
                    key: new triplesec.Buffer(CRYPTER.password),
                    //progress_hook: function (obj) { /* ... */ }
                }, function(err, buff) {
                    ENCRYPTBAR.incr(event.calendar.name);
                    if (! err) {
                        event.d.VCALENDAR[type].DESCRIPTION = buff.toString();
                        triplesec.decrypt ({

                            data: new triplesec.Buffer(event.d.VCALENDAR[type].LOCATION, "hex"),
                            key: new triplesec.Buffer(CRYPTER.password),
                            //progress_hook: function (obj) { /* ... */ }
                        }, function(err, buff) {
                            ENCRYPTBAR.incr(event.calendar.name);
                            if (! err) {
                                event.d.VCALENDAR[type].LOCATION = buff.toString();
                                callback(event);
                            }
                        });
                    }
                });
            }
        });
    }
}


