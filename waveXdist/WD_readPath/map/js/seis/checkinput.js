function checkInput() {
    let index = $('#catalog')[0].selectedIndex;
    let dateFrom = $('#datefrom')[0];
    let dateTo = $('#dateto')[0];
    let depthMin = $('#depthMin')[0];
    let depthMax = $('#depthMax')[0];
    let magMin = $('#magMin')[0];
    let magMax = $('#magMax')[0];
    let latMax = $('#latMax')[0];
    let latMin = $('#latMin')[0];
    let lonMax = $('#lonMax')[0];
    let lonMin = $('#lonMin')[0];
    let circleSize = $('#circle_size')[0];
    switch (index) {
        case 0: {
            if (dateFrom.disabled && dateTo.disabled) {
                break;
            } else {
                return false;
            }
        }
        case 1: {
            break;
        }
        default: {
            return false;
        }
    };

    // 判斷時間
    if (moment('1990-12-31').isBefore(dateFrom.value) &&
        moment(dateFrom.value).isBefore(dateTo.value) &&
        moment(dateFrom.value)._isValid &&
        moment(dateTo.value)._isValid) {
        // pass 
    } else {
        return false;
    }

    if (Number.isNaN(Number(depthMin.value)) ||
        Number.isNaN(Number(depthMax.value)) ||
        Number.isNaN(Number(latMin.value)) ||
        Number.isNaN(Number(latMax.value)) ||
        Number.isNaN(Number(lonMin.value)) ||
        Number.isNaN(Number(lonMax.value)) ||
        Number.isNaN(Number(magMin.value)) ||
        Number.isNaN(Number(magMax.value)) ||
        Number.isNaN(Number(circleSize.value))
    ) {
        return false;
    } else {
        return true
    }

}