$(function () {
    var observ = document.getElementsByClassName("observablehq");
    observ[0].setAttribute("id", "title");
    observ[1].setAttribute("id", "playController");
    observ[2].setAttribute("id", "speedController");
    observ[3].setAttribute("id", "date");
    observ[4].setAttribute("id", "film");
    // observ[5].setAttribute("id", "legend");

    // $('#banner').append($('#title'));
    $("#animation").append($("#date"));
    $("#animation").append($("#film"));
    // $("#animation").append($("#legend"));


    // $(window).resize(function () {
    var width = $(window).width();
    // var height = $(window).height();

    // if (width > height)
    //     var screen = height;
    // else
    //     var screen = width;

    // window.alert("W:" + width + " H:" + height);
    // width = 100;
    if (width >= 1000 && $('.menu').length < 1) {
        var nav = document.createElement("nav");
        nav.classList.add("menu");
        $('.toggle-menu').after(nav);

        var ul = document.createElement("ul");
        ul.setAttribute("id", "tools");
        ul.classList.add("active");
        $('.menu').append(ul);


        var div = document.createElement("div");
        div.setAttribute("id", "icons");
        $('.menu').append(div);

        $('.menu').BootSideMenu({
            side: "left",
            pushBody: true,
            width: '50vmin',
            icons: {
                left: 'fa fa-angle-double-left fa-1x ',
                right: 'fa fa-angle-double-right fa-1x ',
                down: 'fa fa-angle-double-down fa-1x ',
            },
            theme: 'customtheme',
            closeOnClick: false,
            remember: false,
        });

        //==put title in side menu
        var li = document.createElement("li");
        li.setAttribute("id", "item0");
        li.classList.add("current-item");
        $("#tools").append(li);
        $('#item0').append($('#title'));
        // $('#title:first-child').html("AAA");
        //========================


    }
    else if (width <= 1000) {
        // if ($("#tools").length > 0)
        //     $("#tools").remove();
        var ul = document.createElement("ul");
        ul.setAttribute("id", "tools");
        ul.classList.add("active");
        $('.toggle-menu').append(ul);
        // $('.menu').append(ul);
        // if ($('.menu').length > 0) {
        //     $('.toggle-menu').append($('#playController'));
        //     $('.toggle-menu').append($('#speedController'));
        //     $('.menu').remove();
        // }
        $('#banner').append($('#title'));

        // #date.observablehq--date {

        //     position: absolute;
        //     top: 15vmin;
        //     font - size: 4vmin;
        //     z - index: 10;
        // }

        // $('#date').css({
        //     size: 100,
        //     position: absolute,
        //     top: "150vmin",
        // });
    }
    // });
    for (var i = 0; i < 2; i++) {
        var li = document.createElement("li");
        li.setAttribute("id", "item" + (i + 1));
        li.classList.add("current-item");
        $("#tools").append(li);
    }
    $('#item1').append($('#playController'));
    $('#item2').append($('#speedController'));



    for (var i = 0; i < 2; i++) {
        var img = document.createElement("img");
        img.setAttribute("id", "icon" + (i + 1));
        img.width = "90";
        // img.height = "100";
        $('#icons').append(img);
        // window.alert("AAA");
    }
    $('#icon1').attr("src", "./img/cwb.png");
    $('#icon2').attr("src", "./img/Logo.jpg");

    //=================for window width<=860
    $('.toggle-nav').click(function (e) {
        $(this).toggleClass('active');
        $('.toggle-menu ul').toggleClass('active');

        e.preventDefault();
    });








    //=================legend onScroll
    window.addEventListener("scroll", function (evt) {
        document.querySelector('.legendGroup')
            .setAttribute("y", screenYtoSVGUnits(window.scrollY) + 10);
    });


    // Converts a screen Y position to SVG units which have a viewBox transform
    function screenYtoSVGUnits(val) {
        const svg = document.querySelector("#film>svg");
        let pt = svg.createSVGPoint();
        pt.x = 0;
        pt.y = val;
        pt = pt.matrixTransform(svg.getCTM().inverse());
        return pt.y;
    };



    // from http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
    //     function getScrollXY() {
    //         var scrOfX = 0, scrOfY = 0;
    //         // if (typeof (window.pageYOffset) == 'number') {
    //         //     //Netscape compliant
    //         //     scrOfY = window.pageYOffset;
    //         //     scrOfX = window.pageXOffset;
    //         // } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
    //         //     //DOM compliant
    //         //     scrOfY = document.body.scrollTop;
    //         //     scrOfX = document.body.scrollLeft;
    //         // } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
    //         //     //IE6 standards compliant mode
    //         //     scrOfY = document.documentElement.scrollTop;
    //         //     scrOfX = document.documentElement.scrollLeft;
    //         // }
    //         scrOfY = document.documentElement.scrollTop;
    //         scrOfX = document.documentElement.scrollLeft;
    //         return [scrOfX, scrOfY];
    //     }



    //     var originTrans = null;
    //     function moveFixed(evt) {
    //         var scrollpos = getScrollXY();
    //         var fixed = document.querySelector('.legendGroup');
    //         var tfm = fixed.transform.baseVal.getItem(0);

    //         if (!originTrans) originTrans = [tfm.matrix.e, tfm.matrix.f];
    //         // console.debug(originTrans);
    //         // console.debug(scrollpos);
    //         // tfm.setTranslate(scrollpos[0], scrollpos[1]);
    //         // tfm.setTranslate(scrollpos[0] + originTrans[0], scrollpos[1] + originTrans[1]);

    //         // tfm.setTranslate(window.innerWidth * 0.5, window.innerHeight * 0.5);
    //         tfm.setTranslate(0, 0);
    //         console.debug(evt);
    //         console.debug(fixed.transform);
    //     }

    //     window.onscroll = moveFixed;

});




    // (new Runtime).module(define, name => {
    //     if (name === "viewof keyframe") {
    //         window.alert("AA");
    //         // return new Inspector(document.querySelector(name));
    //         return Inspector.into("#aaa")();
    //     }
    // });

     // new Runtime().module(define, name => {
    //     if (name === "date")
    //         return {
    //             pending() { console.log(`${name} is running…`); },
    //             // fulfilled(value) { console.log(name, value); },
    //             rejected(error) { console.error(error); }
    //         };
    // });

    // document.querySelector("#chart").appendChild(value);
    // window.alert($("#replay"));