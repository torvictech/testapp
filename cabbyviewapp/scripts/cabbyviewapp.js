//Global Variables
var cabbyUser;
var cabbyPass;
var updateId;

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

//Core Functions
function showUpdates() {
    if (cabbyUser == '' || cabbyPass == '') {
        alert('cabbyVIEW ERROR: Username & password fields are mandatory!');
    } else {
        if (navigator.onLine) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var cabbyLat = position.coords.latitude;
                    var cabbyLng = position.coords.longitude;
                    $.ajax({
                        beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
                        complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
                        type: 'POST',
                        url: '../wsapp.asmx/setCabby',
                        cache: false,
                        data: '{"user":"' + cabbyUser + '","pass":"' + cabbyPass + '","lat":"' + cabbyLat + '","lng":"' + cabbyLng + '","dtnow":"' + dtNow + '"}',
                        contentType: 'application/json; charset=utf-8',
                        success: function (e) {
                            if (e.d == 'error') {
                                alert('cabbyVIEW ERROR: Username or password is not valid... Try again!');
                            } else {
                                $('#btnStart').closest('.ui-btn').hide();
                                $('#btnStop').closest('.ui-btn').show();
                                $('#geoLoc').html('<br />Lat: ' + cabbyLat + ' Lng: ' + cabbyLng).trigger('create');
                            }
                        },
                        error: function (e) {
                            alert('cabbyVIEW ERROR: Unable to update your location at this time, trying again!');
                        }
                    });
                });
            } else {
                alert('cabbyVIEW ERROR: You must enable your GPS/Geolocation to use this application!');
            }
        } else {
            InternetError();
        }
    }
    return false;
}

//GPS Check
$(document).on('pageinit', function () {
    if (!navigator.geolocation) {
        alert('cabbyVIEW ERROR: You must enable your GPS/Geolocation to use this application!');
    }
    $('#btnStop').closest('.ui-btn').hide();
});

//App Start
$('#btnStart').live('click', function () {
    getLongDT();
    cabbyUser = $('#inpUsername').val();
    cabbyPass = $('#inpPassword').val();
    showUpdates();
    updateId = setInterval(showUpdates, 5000); //60,000 milliseconds is one minute - Using 5 (5000) second updates
    return false;
});

//App Stop
$('#btnStop').live('click', function () {
    $.ajax({
        beforeSend: function () { $.mobile.showPageLoadingMsg(); }, //Show spinner
        complete: function () { $.mobile.hidePageLoadingMsg() }, //Hide spinner
        type: 'POST',
        url: '../wsapp.asmx/stopCabby',
        cache: false,
        data: '{"user":"' + cabbyUser + '","pass":"' + cabbyPass + '","dtnow":"' + dtNow + '"}',
        contentType: 'application/json; charset=utf-8',
        success: function (e) {
            if (e.d == 'error') {
                alert('cabbyVIEW ERROR: Username or password is not valid... Try again!');
            } else {
                $('#btnStart').closest('.ui-btn').show();
                $('#btnStop').closest('.ui-btn').hide();
                $('#geoLoc').html('');
                clearInterval(updateId);
            }
        },
        error: function (e) {
            alert('cabbyVIEW ERROR: Unable to update your location at this time, trying again!');
        }
    });
    return false;
});