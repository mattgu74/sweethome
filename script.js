App.controller('home', function (page) {
  // put stuff here
});

App.controller('apropos', function (page) {
  // put stuff here
});

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
  login();
  App.restore();
} catch (err) {
  App.load('home');
}