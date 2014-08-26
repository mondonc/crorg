// Crypter class
function Crypter(password) {

    this.password = password;

    this.encrypt = function(event, callback) {

        event.d["PRODID"] = "CRORG";

        triplesec.encrypt ({

            data: new triplesec.Buffer(event.d.VCALENDAR.VEVENT.SUMMARY),
            key: new triplesec.Buffer(CRYPTER.password),
            //progress_hook: function (obj) { console.log(obj); }
        }, function(err, buff) {
            ENCRYPTBAR.incr();
            if (! err) {
                event.d.VCALENDAR.VEVENT.SUMMARY = buff.toString('hex');

                triplesec.encrypt ({

                    data: new triplesec.Buffer(event.d.VCALENDAR.VEVENT.DESCRIPTION),
                    key: new triplesec.Buffer(CRYPTER.password),
                    //progress_hook: function (obj) { /* ... */ }
                }, function(err, buff) {
                    ENCRYPTBAR.incr();
                    if (! err) {
                        event.d.VCALENDAR.VEVENT.DESCRIPTION = buff.toString('hex');
                        triplesec.encrypt ({

                            data: new triplesec.Buffer(event.d.VCALENDAR.VEVENT.LOCATION),
                            key: new triplesec.Buffer(CRYPTER.password),
                            //progress_hook: function (obj) { /* ... */ }
                        }, function(err, buff) {
                            ENCRYPTBAR.incr();
                            if (! err) {
                                event.d.VCALENDAR.VEVENT.LOCATION = buff.toString('hex');
                                event.content = event._getICS(event.d);
                                callback(event);
                            }
                        });
                    }
                });
            }
        });
    }

    this.decrypt = function(event, callback) {

        triplesec.decrypt ({

            data: new triplesec.Buffer(event.d.VCALENDAR.VEVENT.SUMMARY, "hex"),
            key: new triplesec.Buffer(CRYPTER.password),
            //progress_hook: function (obj) { /* ... */ }
            //progress_hook: function (obj) { console.log(obj); }
        }, function(err, buff) {
            ENCRYPTBAR.incr();
            if (! err) {
                event.d.VCALENDAR.VEVENT.SUMMARY = buff.toString();

                triplesec.decrypt ({

                    data: new triplesec.Buffer(event.d.VCALENDAR.VEVENT.DESCRIPTION, "hex"),
                    key: new triplesec.Buffer(CRYPTER.password),
                    //progress_hook: function (obj) { /* ... */ }
                }, function(err, buff) {
                    ENCRYPTBAR.incr();
                    if (! err) {
                        event.d.VCALENDAR.VEVENT.DESCRIPTION = buff.toString();
                        triplesec.decrypt ({

                            data: new triplesec.Buffer(event.d.VCALENDAR.VEVENT.LOCATION, "hex"),
                            key: new triplesec.Buffer(CRYPTER.password),
                            //progress_hook: function (obj) { /* ... */ }
                        }, function(err, buff) {
                            ENCRYPTBAR.incr();
                            if (! err) {
                                event.d.VCALENDAR.VEVENT.LOCATION = buff.toString();
                                callback(event);
                            }
                        });
                    }
                });
            }
        });
    }
}


