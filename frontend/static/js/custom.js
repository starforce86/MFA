(function ($) {
    "use strict"; // Start of use strict

    // Toggle the side navigation
    $(document).on('click', '#sidebarToggle', function (e) {
        e.preventDefault();
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
    });

    // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
    $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function (e) {
        if ($window.width() > 768) {
            var e0 = e.originalEvent,
                delta = e0.wheelDelta || -e0.detail;
            this.scrollTop += (delta < 0 ? 1 : -1) * 30;
            e.preventDefault();
        }
    });

    // Category Owl Carousel
    const objowlcarousel = $('.owl-carousel-category');
    if (objowlcarousel.length > 0) {
        objowlcarousel.owlCarousel({
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 3,
                    nav: false
                },
                1000: {
                    items: 4,
                },
                1200: {
                    items: 8,
                },
            },
            loop: true,
            lazyLoad: true,
            autoplay: true,
            autoplaySpeed: 1000,
            autoplayTimeout: 2000,
            autoplayHoverPause: true,
            nav: true,
            navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
        });
    }

    // Login Owl Carousel
    const mainslider = $('.owl-carousel-login');
    if (mainslider.length > 0) {
        mainslider.owlCarousel({
            items: 1,
            lazyLoad: true,
            loop: true,
            autoplay: true,
            autoplaySpeed: 1000,
            autoplayTimeout: 2000,
            autoplayHoverPause: true,
        });
    }


    // Tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Scroll to top button appear
    $(document).on('scroll', function () {
        var scrollDistance = $(this).scrollTop();
        if (scrollDistance > 100) {
            $('.scroll-to-top').fadeIn();
        } else {
            $('.scroll-to-top').fadeOut();
        }
    });

    // Smooth scrolling using jQuery easing
    $(document).on('click', 'a.scroll-to-top', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top)
        }, 1000, 'easeInOutExpo');
        event.preventDefault();
    });

})(jQuery); // End of use strict

setInterval(() => { //todo hack. remove me and fix page "login page shadow" after logout
    $('body > div.modal-backdrop.fade.show').removeClass('modal-backdrop fade show');
}, 1000);

var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
(function () {
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/5cf92728267b2e5785312c14/default';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
})();
