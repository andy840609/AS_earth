function calDateUTC() {
    let date = new Date();
    let y = date.getUTCFullYear();
    let m = date.getUTCMonth();
    let d = date.getUTCDate();

    let monthLocal = date.getMonth() + 1;
    if (monthLocal < 10) { monthLocal = "0" + monthLocal };
    let h = date.getUTCHours();
    let M = date.getUTCMinutes();
    let s = date.getUTCSeconds();
    let date_90 = new Date(y, m, d, h, M, s);
    let day = date_90.getDate();
    let month = date_90.getMonth() + 1;
    let year = date_90.getFullYear();
    if (month < 10) { month = "0" + month };
    if (day < 10) { day = "0" + day };
    let dayLocal = date.getDate() < 10 ? "0" + (date.getDate()) : (date.getDate());
    let todayUTC = year + "-" + month + "-" + day;
    let todayLocal = year + "-" + monthLocal + "-" + dayLocal;

    let AddDayCount = -90;
    let dd = new Date(y, m, d, h, M, s);
    dd.setDate(dd.getDate() + AddDayCount);
    let yy = dd.getFullYear();
    let mm = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);
    let dday = (dd.getDate()) < 10 ? "0" + (dd.getDate()) : (dd.getDate());
    let day_90 = yy + "-" + mm + "-" + dday;
    dd = {};
    dd['todayUTC'] = todayUTC;
    dd['day_90'] = day_90;
    dd['todayLocal'] = todayLocal;
    return dd;
}

$(document).ready(function () {

    let dd = calDateUTC();
    $("#dateUTC")[0].innerHTML = "Date (UTC+8)"
    $("#dateto").attr("value", dd.todayLocal);
    $("#datefrom").attr("value", dd.day_90);
    get_events();

}
);
