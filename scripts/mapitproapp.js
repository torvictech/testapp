//Global Variables
top.updateId = '';
top.pinUser = '';
top.pinPswd = '';
top.pinActive = '';
var wsURL = 'http://www.mapitpro.com/mipservice.asmx/';
//var wsURL = '../mipservice.asmx/';

//Supporting Functions
function getLongDT() {
    Number.prototype.padLeft = function (base, chr) {
        var len = (String(base || 10).length - String(this).length) + 1;
        return len > 0 ? new Array(len).join(chr || '0') + this : this;
    }
    var d = new Date;
    var ap = d.getHours() >= 12 ? 'PM' : 'AM';
    var hrs = d.getHours() % 12;
    hrs = hrs ? hrs : 12;
    dformat = [d.getFullYear(), (d.getMonth() + 1).padLeft(), d.getDate().padLeft()].join('-') + '  ' + [hrs, d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':') + ' ' + ap;
    dtNow = dformat;
    return dtNow; //long date format: yyyy-MM-dd h:mm:ss PM/AM
}

function appInterval() {
    top.updateId = setInterval(appUpdate, 10000); //60,000 milliseconds is one minute
    top.pinActive = true;
}

function internetError() {
    $('<div data-role="popup" id="popInternet" data-theme="a" data-position-to="window" data-transition="pop"><p>MapitPRO ALERT: Internet connectivity is unavailable... trying again!<p></div>').popup();
    $('#popInternet').popup('open');
    setTimeout(function () { $('#popInternet').popup('close'); }, 5000); //60,000 milliseconds is one minute
}

function technicalError() {
    $('<div data-role="popup" id="popTechnical" data-theme="a" data-position-to="window" data-transition="pop"><p>MapitPRO ALERT: System error... trying again!<p></div>').popup();
    $('#popTechnical').popup('open');
    setTimeout(function () { $('#popTechnical').popup('close'); }, 5000); //60,000 milliseconds is one minute
}

function appLogin() {
    if (top.pinUser == '' || top.pinPswd == '') {
        alert('MapitPRO ERROR: Username & password fields are mandatory!');
    } else {
        if (navigator.onLine) {
            getLongDT();
            $.ajax({
                beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
                complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
                type: 'POST',
                url: wsURL + 'appLogin',
                cache: false,
                data: '{"user":"' + top.pinUser + '","pass":"' + top.pinPswd + '","dtnow":"' + dtNow + '"}',
                contentType: 'application/json; charset=utf-8',
                success: function (e) {
                    if (e.d == 'error') {
                        alert('MapitPRO ERROR: Username or password is not valid... Try again!');
                    } else {
                        var objNDS = jQuery.parseJSON(e.d);
                        var objTbl = objNDS.NewDataSet.Table;
                        if (objTbl.PIN_AUTHORIZED == 'true') {
                            $('#inpUsername').textinput('disable');
                            $('#inpPassword').textinput('disable');
                            $('#btnLogin').closest('.ui-btn').hide();
                            $('#btnLogout').closest('.ui-btn').show();
                            appActive();
                        } else {
                            alert('MapitPRO ERROR: Username is not authorized... Contact your system administrator!');
                        }
                    }
                },
                error: function (e) {
                    technicalError();
                }
            });
        } else {
            internetError();
        }
    }
    return false;
}

function appActive() {
    if (navigator.onLine) {
        getLongDT();
        $.ajax({
            beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
            complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
            type: 'POST',
            url: wsURL + 'appActive',
            cache: false,
            data: '{"user":"' + top.pinUser + '","pass":"' + top.pinPswd + '","dtnow":"' + dtNow + '"}',
            contentType: 'application/json; charset=utf-8',
            success: function (e) {
                if (e.d == 'error') {
                    alert('MapitPRO ERROR: Username or password is not valid... Try again!');
                } else {
                    var objNDS = jQuery.parseJSON(e.d);
                    var objTbl = objNDS.NewDataSet.Table;
                    if (objTbl instanceof Array) {
                        $.each(objTbl, function (i, val) {
                            if (val.PIN_ACTIVE == 'true') {
                                $('#btnStart').closest('.ui-btn').hide();
                                $('#btnStop').closest('.ui-btn').show();
                                appInterval();
                            } else {
                                $('#btnStart').closest('.ui-btn').show();
                                $('#btnStop').closest('.ui-btn').hide();
                                $('#geoLoc').html('');
                            }
                        });
                    } else {
                        if (objTbl.PIN_ACTIVE == 'true') {
                            $('#btnStart').closest('.ui-btn').hide();
                            $('#btnStop').closest('.ui-btn').show();
                            appInterval();
                        } else {
                            $('#btnStart').closest('.ui-btn').show();
                            $('#btnStop').closest('.ui-btn').hide();
                            $('#geoLoc').html('');
                        }
                    }
                }
            },
            error: function (e) {
                technicalError();
            }
        });
    } else {
        internetError();
    }
    return false;
}

function appUpdate() {
    if (navigator.onLine) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pinLat = position.coords.latitude;
                var pinLng = position.coords.longitude;
                getLongDT();
                $.ajax({
                    beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
                    complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
                    type: 'POST',
                    url: wsURL + 'appUpdate',
                    cache: false,
                    data: '{"user":"' + top.pinUser + '","pass":"' + top.pinPswd + '","lat":"' + pinLat + '","lng":"' + pinLng + '","dtnow":"' + dtNow + '"}',
                    contentType: 'application/json; charset=utf-8',
                    success: function (e) {
                        if (e.d == 'success') {
                            $('#geoLoc').html('<br />Lat: ' + pinLat + ' Lng: ' + pinLng).trigger('create');
                        } else {
                            alert('MapitPRO ERROR: Unable to update location... Quit application and try again!');
                        }
                    },
                    error: function (e) {
                        technicalError();
                    }
                });
            });
        } else {
            alert('MapitPRO ERROR: You must enable your GPS/Geolocation on your device to use this application!');
        }
    } else {
        internetError();
    }
    return false;
}

function appStop() {
    if (navigator.onLine) {
        getLongDT();
        $.ajax({
            beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
            complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
            type: 'POST',
            url: wsURL + 'appStop',
            cache: false,
            data: '{"user":"' + top.pinUser + '","pass":"' + top.pinPswd + '","dtnow":"' + dtNow + '"}',
            contentType: 'application/json; charset=utf-8',
            success: function (e) {
                if (e.d == 'success') {
                    $('#btnStart').closest('.ui-btn').show();
                    $('#btnStop').closest('.ui-btn').hide();
                    $('#geoLoc').html('');
                    clearInterval(top.updateId);
                    top.updateId = '';
                    top.pinActive = false;
                } else {
                    alert('MapitPRO ERROR: Unable to stop application... Quit application and try again!');
                }
            },
            error: function (e) {
                technicalError();
            }
        });
    } else {
        internetError();
    }
    return false;
}

function appLogout() {
    if (navigator.onLine) {
        getLongDT();
        $.ajax({
            beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
            complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
            type: 'POST',
            url: wsURL + 'appStop',
            cache: false,
            data: '{"user":"' + top.pinUser + '","pass":"' + top.pinPswd + '","dtnow":"' + dtNow + '"}',
            contentType: 'application/json; charset=utf-8',
            success: function (e) {
                if (e.d == 'success') {
                    $('#inpUsername').textinput('enable');
                    $('#inpPassword').textinput('enable');
                    $('#btnLogin').closest('.ui-btn').show();
                    $('#btnLogout').closest('.ui-btn').hide();
                    $('#btnStart').closest('.ui-btn').hide();
                    $('#btnStop').closest('.ui-btn').hide();
                    $('#geoLoc').html('');
                    clearInterval(top.updateId);
                    top.updateId = '';
                    top.pinActive = false;
                } else {
                    alert('MapitPRO ERROR: Unable to stop application... Quit application and try again!');
                }
            },
            error: function (e) {
                technicalError();
            }
        });
    } else {
        internetError();
    }
    return false;
}

//App Login
$('#btnLogin').live('click', function () {
    top.pinUser = $('#inpUsername').val();
    top.pinPswd = $('#inpPassword').val();
    appLogin();
});

//App Logout
$('#btnLogout').live('click', function () {
    appLogout();
    top.pinUser = '';
    top.pinPswd = '';
});

//App Start
$('#btnStart').live('click', function () {
    $('#btnStart').closest('.ui-btn').hide();
    $('#btnStop').closest('.ui-btn').show();
    appUpdate();
    appInterval();
});

//App Stop
$('#btnStop').live('click', function () {
    appStop();
});