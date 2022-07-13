const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const fetch = require("node-fetch");
const proxy = require('express-http-proxy');
const request = require('request');
const qs = require('querystring');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/map', function(req,res){
    res.sendFile(path.join(__dirname, 'public', 'html/map.html'))
});

app.get('/xdmap', function(req,res){
    res.sendFile(path.join(__dirname, 'public', 'html/xdmap.html'))
});

app.get('/maptest', function(req,res){
    res.sendFile(path.join(__dirname, 'public', 'html/map_before.html'))
});

const wmsUrl = "http://api.vworld.kr/req/wms";
const wfsUrl = "http://api.vworld.kr/req/wfs";
app.get('/proxywms', function(req, res) {    
    var url = wmsUrl +"?" + qs.stringify(req.query);
    //console.log('/fileThumbnail going to url' + url); 
    request.get(url).pipe(res);
});

app.get('/proxywfs', function(req, res) {    
    var url = wfsUrl +"?" + qs.stringify(req.query);
    //console.log('/fileThumbnail going to url' + url); 
    request.get(url).pipe(res);
});

app.use('/', function(req, res){
    res.send('Hello cesium');
});

app.listen(8000, function(){
    console.log("Hello Cesium");
});



