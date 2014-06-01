App.controller('home', function (page) {
	var $page = $(page);
	var $mens_input = $page.find('#mens-input');
	var $ladies_input = $page.find('#ladies-input')
	var $go_button = $page.find('#go-button');
	var $result = $page.find('#result');
	
	var is_a_boy = true;
	
	$mens_input.on('click', function() {
		$mens_input.attr("src", "mens_black.png");
		$ladies_input.attr("src", "ladies_white.png");
		is_a_boy = true;
	});
	
	$ladies_input.on('click', function() {
		$mens_input.attr("src", "mens_white.png");
		$ladies_input.attr("src", "ladies_black.png");
		is_a_boy = false;
	});
	
	$go_button.on('click', function() {
		login();
	});
});

App.controller('apropos', function (page) {
  // put stuff here
});

function displayAlcoolemie(taux) {
	var $result = $('#result');
	var $taux = $result.find("#taux");
	var $description = $result.find("#description");
	var $image = $result.find("#image");
	
	$taux.html(taux + "g");
	if (taux > 0.5) {
		$description.html("T'es pas en état de conduire buddy...");
		$image.html('<img src="drunk_cat.jpg" alt="drunk cat"/>');
	}
	else {
		$description.html("Sois prudent en prenant le volant");
		$image.html('<img src="driving_cat.jpg" alt="driving cat"/>');
	}
}

function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

var params = getSearchParameters();

function handle(data) {
  if(data.CAS) {
    window.location.href = data.CAS;
  } else if (data.SUCCESS) {
	
  } else {
    console.log(data);
  }
}

function login() {
  if(params.ticket) {
    $.ajax({
      type: 'GET',
      url: 'backend.php',
      data: { service: location.protocol + '//' + location.host + location.pathname, ticket: params.ticket },
      dataType: 'json',
      timeout: 3000,
      context: $('body'),
      success: function(data) {
        handle(data)
      },
      error: function(xhr, type){
        alert('Ajax error! ' + type)
      }
    });  
  } else {
    $.ajax({
      type: 'GET',
      url: 'backend.php',
      data: { service: document.URL },
      dataType: 'json',
      timeout: 3000,
      context: $('body'),
      success: function(data) {
        handle(data);
      },
      error: function(xhr, type){
        alert('Ajax error! ' + type)
      }
    });
  }
}

try {
    App.restore();
} catch (err) {
    App.load('home');
}