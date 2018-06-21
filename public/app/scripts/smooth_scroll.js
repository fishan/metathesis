if (window.addEventListener) window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;

function wheel(event) {
    var delta = 0;
    if (event.wheelDelta) delta = event.wheelDelta / 120;
    else if (event.detail) delta = -event.detail / 3;

    handle(delta);
    if (event.preventDefault) event.preventDefault();
    event.returnValue = false;
    //console.log( 'Текущая прокрутка сверху: ' + window.pageYOffset );
    //console.log( 'Текущая прокрутка слева: ' + window.pageXOffset );
}

var goUp = true;
var end = null;
var interval = null;
var docHeight = $(document).height();
var scrollHeight = Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight
);

console.log( 'Высота с учетом прокрутки: ' + scrollHeight );


function handle(delta) {
	var animationInterval = 5; //lower is faster
	var scrollSpeed = 15; //lower is faster

	if (end === null) {
		end = $(window).scrollTop();
	}
	end -= 50 * delta;
	goUp = delta > 0;
	if ($(window).scrollTop() > $(document).height()){
	$('html, body').animate({ scrollTop: docHeight }, 50);
	}
	if (interval === null) {
		interval = setInterval(function () {
			var scrollTop = $(window).scrollTop();
			var step = Math.round((end - scrollTop) / scrollSpeed);
			if (scrollTop <= 0 || scrollTop >= $(window).prop("scrollHeight") - $(window).height() ||goUp && step > -1 ||!goUp && step < 1 ) {
				clearInterval(interval);
				interval = null;
				end = null;

			}
			$(window).scrollTop(scrollTop + step );

		}, animationInterval);
	}
}
