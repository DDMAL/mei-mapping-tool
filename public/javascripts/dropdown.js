//Hamburger Menu
$(document).ready(function($) {
  if ($(window).width() < 1200) {
    $(".navigate").hide();
  } else {
    $('.mobile-nav').hide();
  }
  $('.menu-btn').click(function() {
    $('.responsive-menu').toggleClass('expand');
  });
});

//Screen resize testing
$(window).resize(function() {
  if ($(window).width() < 1200) {
    $('.navigate').hide();
    $('.mobile-nav').show();
  } else {
    $('.mobile-nav').hide();
    $('.navigate').show();
  }
});
function animation(x) {
  x.classList.toggle("change");
}





