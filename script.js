App.controller('home', function (page) {
	var $page = $(page);
	var $mens_input = $page.find('#mens-input');
	var $ladies_input = $page.find('#ladies-input')
	var $go_button = $page.find('#go-button');
	$weight_input = $page.find("#weight-input");
	var $result = $page.find('#result');
	
	if (my_sex() == "M") {
		select_mens();
	}
	else {
		select_ladies();
	}
	$weight_input.val(weight());
	
	function select_mens() {
		$mens_input.attr("src", "mens_black.png");
		$ladies_input.attr("src", "ladies_white.png");
		set_my_sex("M");
	}
	
	function select_ladies() {
		$mens_input.attr("src", "mens_white.png");
		$ladies_input.attr("src", "ladies_black.png");
		set_my_sex("F");
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

function my_sex() {
	return sessionStorage.getItem("my_sex");
}

function set_my_sex(v) {
	sessionStorage.setItem("my_sex", v);
}

function weight() {
	w = sessionStorage.getItem("weight");
  if(!w) {
    return 70;
  } else {
    return w;
  }
}

function set_weight(v) {
	sessionStorage.setItem("weight", v);
}

function displayAlcoolemie(taux) {
	var $result = $('#result');
	var $taux = $result.find("#taux");
	var $description = $result.find("#description");
	var $image = $result.find("#image");
	
	$taux.html(taux + "g/L de sang");
  if(taux == 0) {
    $description.html("A priori, tu n'es pas sous l'effet de l'alcool, c'est bien.");
  } else if (taux < 0.5) {
    $description.html("Tu as un peu bu, mais il semble que tu puisses prendre le volant, fait quand même attention.");
  } else if (taux < 2) {
		$description.html("Tu n'es pas en état de conduire, fait attention à toi.");
	} else {
		$description.html("Arrête de boire ! N'oublie pas qu'à 3g/L tu risques le coma éthylique !");
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
     var d1 = new Date(data.SUCCESS.date.date);
     var now = new Date();
     var $heure = $result.find("#heure");
     if (d1 > now) {
      $heure.html("Ce taux sera atteint dans "+(d1 - now)/60000+"min.");
     } else {
      $heure.html("Vous étiez à " + data.SUCCESS.tauxmax + " g/L de sang il y'a "+(now - d1)/60000+"min.");
     }
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
          masse: weight(),
          sexe: my_sex()
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