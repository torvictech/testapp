//Global Variables
top.updateId;
top.cabbyUser;
top.cabbyPass;
top.cabbyIsActive;
//Internet URLs
top.loginCabbyURL = 'http://www.cabbyview.com/cvservice.asmx/loginCabby';
top.activeCabbyURL = 'http://www.cabbyview.com/cvservice.asmx/activeCabby';
top.updateCabbyURL = 'http://www.cabbyview.com/cvservice.asmx/updateCabby';
top.stopCabbyURL = 'http://www.cabbyview.com/cvservice.asmx/stopCabby';
//Local URLs
//top.loginCabbyURL = '../../cvservice.asmx/loginCabby';
//top.activeCabbyURL = '../../cvservice.asmx/activeCabby';
//top.updateCabbyURL = '../../cvservice.asmx/updateCabby';
//top.stopCabbyURL = '../../cvservice.asmx/stopCabby';

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

function loginApp() {
    if (top.cabbyUser == '' || top.cabbyPass == '') {
        alert('cabbyVIEW ERROR: Username & password fields are mandatory!');
    } else {
        if (navigator.onLine) {
            getLongDT();
            $.ajax({
                beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
                complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
                type: 'POST',
                url: top.loginCabbyURL,
                cache: false,
                data: '{"user":"' + top.cabbyUser + '","pass":"' + top.cabbyPass + '","dtnow":"' + dtNow + '"}',
                contentType: 'application/json; charset=utf-8',
                success: function (e) {
                    if (e.d == 'error') {
                        alert('cabbyVIEW ERROR: Username or password is not valid... Try again!');
                    } else {
                        $('#inpUsername').textinput('disable');
                        $('#inpPassword').textinput('disable');
                        $('#btnLogin').closest('.ui-btn').hide();
                        $('#btnLogout').closest('.ui-btn').show();
                        activeApp();
                    }
                },
                error: function (e) {
                    alert('cabbyVIEW ERROR: Unable to obtain data at this time, trying again!');
                }
            });
        } else {
            InternetError();
        }
    }
    return false;
}

function activeApp() {
    if (navigator.onLine) {
        getLongDT();
        $.ajax({
            beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
            complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
            type: 'POST',
            url: top.activeCabbyURL,
            cache: false,
            data: '{"user":"' + top.cabbyUser + '","pass":"' + top.cabbyPass + '","dtnow":"' + dtNow + '"}',
            contentType: 'application/json; charset=utf-8',
            success: function (e) {
                if (e.d == 'error') {
                    alert('cabbyVIEW ERROR: Username or password is not valid... Try again!');
                } else {
                    var objNDS = jQuery.parseJSON(e.d);
                    var objTbl = objNDS.NewDataSet.Table;
                    if (objTbl instanceof Array) {
                        $.each(objTbl, function (i, val) {
                            if (val.CABBY_ACTIVE == "yes") {
                                $('#btnStart').closest('.ui-btn').hide();
                                $('#btnStop').closest('.ui-btn').show();
                                intervalApp();
                            } else {
                                $('#btnStart').closest('.ui-btn').show();
                                $('#btnStop').closest('.ui-btn').hide();
                                $('#geoLoc').html('');
                            }
                        });
                    } else {
                        if (objTbl.CABBY_ACTIVE == "yes") {
                            $('#btnStart').closest('.ui-btn').hide();
                            $('#btnStop').closest('.ui-btn').show();
                            intervalApp();
                        } else {
                            $('#btnStart').closest('.ui-btn').show();
                            $('#btnStop').closest('.ui-btn').hide();
                            $('#geoLoc').html('');
                        }
                    }
                }
            },
            error: function (e) {
                alert('cabbyVIEW ERROR: Unable to obtain data at this time, trying again!');
            }
        });
    } else {
        InternetError();
    }
    return false;
}

function updateApp() {
    if (navigator.onLine) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var cabbyLat = position.coords.latitude;
                var cabbyLng = position.coords.longitude;
                getLongDT();
                $.ajax({
                    beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
                    complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
                    type: 'POST',
                    url: top.updateCabbyURL,
                    cache: false,
                    data: '{"user":"' + top.cabbyUser + '","pass":"' + top.cabbyPass + '","lat":"' + cabbyLat + '","lng":"' + cabbyLng + '","dtnow":"' + dtNow + '"}',
                    contentType: 'application/json; charset=utf-8',
                    success: function (e) {
                        if (e.d != 'error') {
                            $('#geoLoc').html('<br />Lat: ' + cabbyLat + ' Lng: ' + cabbyLng).trigger('create');
                        }
                    },
                    error: function (e) {
                        alert('cabbyVIEW ERROR: Unable to obtain data at this time, trying again!');
                    }
                });
            });
        } else {
            alert('cabbyVIEW ERROR: You must enable your GPS/Geolocation to use this application!');
        }
    } else {
        InternetError();
    }
    return false;
}

function stopApp() {
    if (navigator.onLine) {
        getLongDT();
        $.ajax({
            beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
            complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
            type: 'POST',
            url: top.stopCabbyURL,
            cache: false,
            data: '{"user":"' + top.cabbyUser + '","pass":"' + top.cabbyPass + '","dtnow":"' + dtNow + '"}',
            contentType: 'application/json; charset=utf-8',
            success: function (e) {
                if (e.d != 'error') {
                    $('#btnStart').closest('.ui-btn').show();
                    $('#btnStop').closest('.ui-btn').hide();
                    $('#geoLoc').html('');
                    clearInterval(top.updateId);
                    top.updateId = '';
                    top.cabbyIsActive = false;
                }
            },
            error: function (e) {
                alert('cabbyVIEW ERROR: Unable to stop at this time, trying again!');
            }
        });
    } else {
        InternetError();
    }
    return false;
}

function logoutApp() {
    if (navigator.onLine) {
        getLongDT();
        $.ajax({
            beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
            complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
            type: 'POST',
            url: top.stopCabbyURL,
            cache: false,
            data: '{"user":"' + top.cabbyUser + '","pass":"' + top.cabbyPass + '","dtnow":"' + dtNow + '"}',
            contentType: 'application/json; charset=utf-8',
            success: function (e) {
                if (e.d != 'error') {
                    $('#inpUsername').textinput('enable');
                    $('#inpPassword').textinput('enable');
                    $('#btnLogin').closest('.ui-btn').show();
                    $('#btnLogout').closest('.ui-btn').hide();
                    $('#btnStart').closest('.ui-btn').hide();
                    $('#btnStop').closest('.ui-btn').hide();
                    $('#geoLoc').html('');
                    clearInterval(top.updateId);
                    top.updateId = '';
                    top.cabbyIsActive = false;
                }
            },
            error: function (e) {
                alert('cabbyVIEW ERROR: Unable to stop at this time, trying again!');
            }
        });
    } else {
        InternetError();
    }
    return false;
}

function intervalApp() {
    top.updateId = setInterval(updateApp, 10000); //60,000 milliseconds is one minute
    top.cabbyIsActive = true;
}

//App Login
$('#btnLogin').live('click', function () {
    top.cabbyUser = $('#inpUsername').val();
    top.cabbyPass = $('#inpPassword').val();
    loginApp();
});

//App Logout
$('#btnLogout').live('click', function () {
    logoutApp();
    top.cabbyUser = '';
    top.cabbyPass = '';
});

//App Start
$('#btnStart').live('click', function () {
    $('#btnStart').closest('.ui-btn').hide();
    $('#btnStop').closest('.ui-btn').show();
    updateApp();
    intervalApp();
});

//App Stop
$('#btnStop').live('click', function () {
    stopApp();
});