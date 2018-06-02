$(document).ready(function(){
  $('#nav-dropdown').on('click',function(){
    $('.dropdown-content').toggle();
  });
  $(document).mouseup(function(e) 
  {
    var container = $(".dropdown-content");
    var con2 = $('.dropdown-servicios');

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
        container.hide();
    if (!con2.is(e.target) && con2.has(e.target).length === 0)
        con2.hide();
  });
  $('.nav-servicios').on('click',function(){
    $('.dropdown-servicios').toggle();
  });

});