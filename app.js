var express = require('express');
var app = express();
var key = 'NJDdbKOFJopjpR571rBLghfjGiIl2c4S7TQKARAmKo6w4Cg85bwSiGkzy9oLSWYamu2cZCP%2BylsmdHGhExiOXQ%3D%3D';
app.locals.pretty = true;
var routelist = [];

var request = require('request');
var cheerio = require('cheerio');

app.get('/',function(req, res) {
  res.send('BUS Root - Node.js <br>' + Date() );
});

app.get('/bus', function(req, res) {
  res.render('bus.jade', {time:Date()} );
});

app.get('/bus_check', function(req, res) {
  var url = 'http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + key;
  var id = req.query.id;

  queryParams += '&' + encodeURIComponent('strSrch') + '=' + encodeURIComponent( id );

  request({
    url: url + queryParams,
    method: 'GET'
    }, function (error, response, body) {
    
    $ = cheerio.load(body);
    $('busArrivalList').each(function(idx) {
       var no1 = $(this).find('plateNo1').text();
       var no2 = $(this).find('plateNo2').text();
       console.log(`도착 예정 버스: ${no1}, 다음 도착버스: ${no2 ? no2 : '---'}`);
    });

    console.log(' ');   
    res.send('BUS: ' + body);

  });
});

app.get('/bus_check35', function(req, res) {
  var url = 'http://ws.bus.go.kr/api/rest/buspos/getBusPosByRtid';
  var busRouteId = '227000043';
  var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + key;
  queryParams += '&' + encodeURIComponent('busRouteId') + '=' + busRouteId;

  var msg = '';
  request({
    url: url + queryParams,
    method: 'GET'
    }, function (error, response, body) {
      msg += makeMsgBusRunning(body, 'sectOrd');

      msg += routelist;
      res.send(msg);
  });

});

function makeMsgBusRunning(body, word)
{
  var msg = "<h2> 35 Bus Information </h2><p>";

  $ = cheerio.load(body);
  var stationsRun = [];
  $('itemList').each(function(idx) {
    var running = $(this).find( word ).text();
    stationsRun.push(running);
  });

  stationsRun.forEach(function(data, idx) {
    msg += "<h1> 구간번호: " +  data + '</h1><p>';
  });

  /*
  var stationsList = [];
  $('itemList').each(function(idx) {
    var name = $(this).find('stationNm').text();
    stationsList.push( name );
  });

  stationsList.forEach(function(data, idx) {
    msg += (idx+1) + '. ' + data + '/<br>';
  });
  */ 

  return msg;
}

app.get('/check_route', function(req, res) {

  var url = 'http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + key;
  
  var busRouteId = '227000043'; //req.query.route;
  queryParams += '&' + encodeURIComponent('busRouteId') + '=' + busRouteId;

  request({
    url: url + queryParams,
    method: 'GET'
    }, function (error, response, body) {
    
    routelist = [];
    var msg = '<h4>';
    $ = cheerio.load(body);

    $('itemList').each(function(idx) {
       var no1 = $(this).find('stationNm').text();
       var item = (idx+1) + '. ' + no1 + '<br>';
       msg += item;
       routelist += item;
    });
    msg += '</h4>';

    res.send( '노선<p>' + msg);
  });
});



app.get('/login', (req, res) => {
  res.render('login.jade');
})

app.get('/login_check', (req, res) => {
   var id = req.query.id;
   var pw = req.query.pw;
   res.send(`id : ${id}, pw : ${pw}`);
})

app.post('/login_check', (req, res) => {
   var id = req.body.id;
   var msg ={};
   var msg ={};
   var pw = req.body.pw;
   res.send(`id : ${id}, pw : ${pw}`);
})

app.listen(80, function() {
   console.log('Connected 80 port');
});

