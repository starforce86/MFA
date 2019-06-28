;(function ($) {
    $(document).ready(function () {
        /*=== Animated Headline ===*/
        //set animation timing
        var animationDelay = 2500,
            //loading bar effect
            barAnimationDelay = 3800,
            barWaiting = barAnimationDelay - 3000, //3000 is the duration of the transition on the loading bar - set in the scss/css file
            //letters effect
            lettersDelay = 50,
            //type effect
            typeLettersDelay = 150,
            selectionDuration = 500,
            typeAnimationDelay = selectionDuration + 800,
            //clip effect
            revealDuration = 600,
            revealAnimationDelay = 1500;

        initHeadline();


        function initHeadline() {
            //insert <i> element for each letter of a changing word
            singleLetters($('.cd-headline.letters').find('b'));
            //initialise headline animation
            animateHeadline($('.cd-headline'));
        }

        function singleLetters($words) {
            $words.each(function () {
                var word = $(this),
                    letters = word.text().split(''),
                    selected = word.hasClass('is-visible');
                for (i in letters) {
                    if (word.parents('.rotate-2').length > 0) letters[i] = '<em>' + letters[i] + '</em>';
                    letters[i] = (selected) ? '<i class="in">' + letters[i] + '</i>' : '<i>' + letters[i] + '</i>';
                }
                var newLetters = letters.join('');
                word.html(newLetters).css('opacity', 1);
            });
        }

        function animateHeadline($headlines) {
            var duration = animationDelay;
            $headlines.each(function () {
                var headline = $(this);

                if (headline.hasClass('loading-bar')) {
                    duration = barAnimationDelay;
                    setTimeout(function () {
                        headline.find('.cd-words-wrapper').addClass('is-loading')
                    }, barWaiting);
                } else if (headline.hasClass('clip')) {
                    var spanWrapper = headline.find('.cd-words-wrapper'),
                        newWidth = spanWrapper.width() + 10
                    spanWrapper.css('width', newWidth);
                } else if (!headline.hasClass('type')) {
                    //assign to .cd-words-wrapper the width of its longest word
                    var words = headline.find('.cd-words-wrapper b'),
                        width = 0;
                    words.each(function () {
                        var wordWidth = $(this).width();
                        if (wordWidth > width) width = wordWidth;
                    });
                    headline.find('.cd-words-wrapper').css('width', width);
                }
                ;

                //trigger animation
                setTimeout(function () {
                    hideWord(headline.find('.is-visible').eq(0))
                }, duration);
            });
        }

        function hideWord($word) {
            var nextWord = takeNext($word);

            if ($word.parents('.cd-headline').hasClass('type')) {
                var parentSpan = $word.parent('.cd-words-wrapper');
                parentSpan.addClass('selected').removeClass('waiting');
                setTimeout(function () {
                    parentSpan.removeClass('selected');
                    $word.removeClass('is-visible').addClass('is-hidden').children('i').removeClass('in').addClass('out');
                }, selectionDuration);
                setTimeout(function () {
                    showWord(nextWord, typeLettersDelay)
                }, typeAnimationDelay);

            } else if ($word.parents('.cd-headline').hasClass('letters')) {
                var bool = ($word.children('i').length >= nextWord.children('i').length) ? true : false;
                hideLetter($word.find('i').eq(0), $word, bool, lettersDelay);
                showLetter(nextWord.find('i').eq(0), nextWord, bool, lettersDelay);

            } else if ($word.parents('.cd-headline').hasClass('clip')) {
                $word.parents('.cd-words-wrapper').animate({width: '2px'}, revealDuration, function () {
                    switchWord($word, nextWord);
                    showWord(nextWord);
                });

            } else if ($word.parents('.cd-headline').hasClass('loading-bar')) {
                $word.parents('.cd-words-wrapper').removeClass('is-loading');
                switchWord($word, nextWord);
                setTimeout(function () {
                    hideWord(nextWord)
                }, barAnimationDelay);
                setTimeout(function () {
                    $word.parents('.cd-words-wrapper').addClass('is-loading')
                }, barWaiting);

            } else {
                switchWord($word, nextWord);
                setTimeout(function () {
                    hideWord(nextWord)
                }, animationDelay);
            }
        }

        function showWord($word, $duration) {
            if ($word.parents('.cd-headline').hasClass('type')) {
                showLetter($word.find('i').eq(0), $word, false, $duration);
                $word.addClass('is-visible').removeClass('is-hidden');

            } else if ($word.parents('.cd-headline').hasClass('clip')) {
                $word.parents('.cd-words-wrapper').animate({'width': $word.width() + 10}, revealDuration, function () {
                    setTimeout(function () {
                        hideWord($word)
                    }, revealAnimationDelay);
                });
            }
        }
        function takeNext($word) {
            return (!$word.is(':last-child')) ? $word.next() : $word.parent().children().eq(0);
        }

        function takePrev($word) {
            return (!$word.is(':first-child')) ? $word.prev() : $word.parent().children().last();
        }

        function switchWord($oldWord, $newWord) {
            $oldWord.removeClass('is-visible').addClass('is-hidden');
            $newWord.removeClass('is-hidden').addClass('is-visible');
        }


        let video = $('#myVideo');
        let playBtn = $('#video-play');
        let bannerContent = $('#first-section .banner-content');
        playBtn.on('click', function (ee) {
            $('#first-section').css('background-image', 'unset');
            // video.show();
            video.css({
                'opacity': '1',
                'visibility': 'visible'
            });
            video.get(0).play();
            bannerContent.fadeOut();
        });
        video.on('click', function () {
            if (this.pasued) {
                // this.play();
                bannerContent.fadeOut();
            } else {
                // this.pause();
                bannerContent.fadeIn();
            }
            // this.paused ? this.play() : this.pause();
        });
        // if (video.get(0).paused) {
        //     bannerContent.fadeOut();
        // } else {
        //     bannerContent.fadeIn();
        // }

        $('#menu-btn').on('click', function () {
           $('.menu-container').toggleClass('menu-toggled');
        });
        $('body').on('click', function (ee) {
            $('.menu-container').removeClass('menu-toggled');
        });
        $('.menu-container, #menu-btn').click(function(event) {
            event.stopPropagation();
        });

        $(document).on('scroll', function () {
            let top = jQuery(document).scrollTop();
            if (top > 100) {
                $('#main-header').addClass('fixed-header');
                $('#page-container').css('margin-top', '-58px');
            } else {
                $('#main-header').removeClass('fixed-header');
                $('#page-container').css('margin-top', '-1px');
            }
        });

        // $('.popup-youtube').magnificPopup({
        //     disableOn: 700,
        //     type: 'iframe',
        //     mainClass: 'mfp-fade',
        //     removalDelay: 160,
        //     preloader: false,
        //
        //     fixedContentPos: false
        // });

        AOS.init({
            once: true
        });

        $('a[href*="#"]').smoothscroll({
            duration:  600
        });

        let hoverElemtnt = $('.mfa-hover-item .item');
        hoverElemtnt.on('mouseenter', function () {
           let hoverContent = $(this).closest('.item').find('.hover-content');
           hoverContent.slideDown(400);
        });
        hoverElemtnt.on('mouseleave', function () {
            let hoverContent = $(this).closest('.item').find('.hover-content');
            hoverContent.slideUp(400);
        });


    }); // === Document Ready ===
})(jQuery);