$('#catalog').on('change', function () {
    let stdate = $("#datefrom");
    let eddate = $("#dateto");
    let dateUTCMarker = $("#dateUTC");
    let output = document.getElementById("output");
    output.innerHTML = "";
    if (this.selectedIndex === 0) {
        // for recently 90 days
        let dd = calDateUTC();
        stdate[0].value = dd.day_90;
        eddate[0].value = dd.todayLocal;
        dateUTCMarker[0].innerHTML = "Date (UTC+8)"
        stdate.attr("disabled", "disabled");
        eddate.attr("disabled", "disabled");
        stdate.closest('.panel').attr("style", "background-color: rgb(200, 200, 200)");
        get_events();
    }
    else if (this.selectedIndex === 1) {        // CWB archive
        dateUTCMarker[0].innerHTML = "Date (UTC)"
        stdate.removeAttr("disabled");
        eddate.removeAttr("disabled");
        stdate.closest('.panel').removeAttr("style");
    }
});


// legend site
let mlLeg = document.getElementById("MLscale");
let depLeg = document.getElementById("depscale");
function mapSize() {
    let mapH = document.querySelector('#Map').getBoundingClientRect().height;
    let attrH = document.querySelector('.leaflet-control-attribution.leaflet-control').getBoundingClientRect().height;
    $('#legPos').css({ top: mapH - attrH + 'px' });
    $(mlLeg).css({ bottom: "-10px" })
    $(depLeg).css({ bottom: mlLeg.getBoundingClientRect().height - 45 + "px" })
    return mapSize;
}
$(window).on('resize', mapSize());

