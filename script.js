App.controller('home', function (page) {
	var $page = $(page);
	var $mens_input = $page.find('#mens-input');
	var $ladies_input = $page.find('#ladies-input')
	var $go_button = $page.find('#go-button');
	$weight_input = $page.find("#weight-input");
	var $result = $page.find('#result');
	
	console.log(sessionStorage);
	if (is_a_boy()) {
		select_mens();
	}
	else {
		select_ladies();
	}
	$weight_input.val(weight());
	
	function select_mens() {
		$mens_input.attr("src", "mens_black.png");
		$ladies_input.attr("src", "ladies_white.png");
		set_is_a_boy(true);
	}
	
	function select_ladies() {
		$mens_input.attr("src", "mens_white.png");
		$ladies_input.attr("src", "ladies_black.png");
		set_is_a_boy(false);
	}
	
	$weight_input.on('keyup', function() {
		set_weight($weight_input.val());
	});
	$mens_input.on('click', select_mens);
	$ladies_input.on('click', select_ladies);
	$go_button.on('click', function() {
		login();
	});
});

App.controller('apropos', function (page) {
  // put stuff here
});

function is_a_boy() {
	var r = sessionStorage.getItem("is_a_boy");
	if (!r) {
		return r;
	}
	else {
		return JSON.parse(r);
	}
}

function set_is_a_boy(v) {
	sessionStorage.setItem("is_a_boy", JSON.stringify(v));
}

function weight() {
	return sessionStorage.getItem("weight");
}

function set_weight(v) {
	sessionStorage.setItem("weight", v);
}

function displayAlcoolemie(taux) {
	var $result = $('#result');
	var $taux = $result.find("#taux");
	var $description = $result.find("#description");
	var $image = $result.find("#image");
	
	$taux.html(taux + "g/L");
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
	   displayAlcoolemie(data.SUCCESS.taux);
  } else {
    console.log(data);
  }
}

function login() {
  if(params.ticket) {
    $.ajax({
      type: 'GET',
      url: 'backend.php',
      data: { 
          service: location.protocol + '//' + location.host + location.pathname, 
          ticket: params.ticket,
          masse: weight()
      },
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
    login();
    App.restore();
} catch (err) {
    App.load('home');
}