
/**
 * Module dependencies.
 */
var cl = require('cluster');
var numCPUs = require('os').cpus().length;
var webSocketServer = require('websocket').server;
var express = require('express')
    , http = require('http')
    , path = require('path')
    , index = require('./routes/index');

var OMTP = require("./OMTP");
var def = require("./define");

var app = express();

var devices = [];

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('ogs'));
app.use(express.cookieSession());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', index.index);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

if(process.env.NODE_ENV == "development"){
    var server = http.createServer(app);
    /**
     * WebSocket server
     */
    var wsServer = new webSocketServer({
        // WebSocket server is tied to a HTTP server. WebSocket request is just
        // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
        httpServer: server
    });

    //This callback function is called every time someone
    //tries to connect to the WebSocket server
    wsServer.on('request', function(request) {
        console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

        // accept connection - you should check 'request.origin' to make sure that
        // client is connecting from your website
        // (http://en.wikipedia.org/wiki/Same_origin_policy)
        var connection = request.accept(null, request.origin);

        // user sent some message
        connection.on('message', function(message) {
            console.log(message);
            //var cmd = message.utf8Data.substr(0, 4);
            //var len = parseInt(message.utf8Data.substr(4, 4));
            //var id = message.utf8Data.substr(4 + 4, len);
            //var seq = message.utf8Data.substr(4 + 4 + len, 4);
            //console.log(len + "," + seq);
            //connection.sendUTF("OKOK" + seq);

            if(cmd == "MSIM"){
                connection.userid = id;
                devices[id] = connection;
                console.log((new Date()) + " Peer "
                    + this.userid + " connected.");
            }
        });

        // user disconnected
        connection.on('close', function(connection) {
            console.log((new Date()) + " Peer "
                + this.userid + " disconnected.");
            devices[this.userid] = null;
        });

    });

    server.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}else{
    if (cl.isMaster) {
        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            cl.fork();
        }

        // As workers come up.
        cl.on('listening', function(worker, address) {
            console.log("A worker with #"+worker.id+" is now connected to " +
                address.address + ":" + address.port);
        });

        cl.on('exit', function(worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
            cl.fork();
        });
    } else {
        // Workers can share any TCP connection
        // In this case its a HTTP server
        var server = http.createServer(app);

        var wsServer = new webSocketServer({
            // WebSocket server is tied to a HTTP server. WebSocket request is just
            // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
            httpServer: server
        });

        // This callback function is called every time someone
        // tries to connect to the WebSocket server
        wsServer.on('request', function(request) {
            console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

            // accept connection - you should check 'request.origin' to make sure that
            // client is connecting from your website
            // (http://en.wikipedia.org/wiki/Same_origin_policy)
            var connection = request.accept(null, request.origin);

            // user sent some message
            connection.on('message', function(message) {
                console.log(message);
                var cmd = message.utf8Data.substr(0, 4);
                var len = parseInt(message.utf8Data.substr(4, 4));
                var id = message.utf8Data.substr(4 + 4, len);
                var seq = message.utf8Data.substr(4 + 4 + len, 4);
                console.log(len + "," + seq);
                connection.sendUTF("OKOK" + seq);
                if(cmd == "MSIM"){
                    connection.userid = id;
                    devices[id] = connection;
                    console.log((new Date()) + " Peer "
                        + this.userid + " connected.");
                }
                pub_business.write(JSON.stringify(obj), 'utf8');
            });

            // user disconnected
            connection.on('close', function(connection) {
                console.log((new Date()) + " Peer "
                    + this.userid + " disconnected.");
                devices[this.userid] = null;
            });

        });

        server.listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
        });
    }
}

context.on('ready', function() {
    var sub = context.socket('SUB');
    pub_business = context.socket('PUB');
    pub_business.connect('business');
    sub.connect("command", function() {
    });
    sub.on('data', function (note) {
        try{
            var obj = eval("(" + note + ")");
            //console.log("deviceID: " + obj.device_id + " command:" + obj.command);
            sendCommand(obj.device_id, obj.command);
        }catch(e){
            console.log(e.msg);
        }
    });
});

//向设备发送指令
function sendCommand(deviceID, command){
    if (devices[deviceID] != null) {
        var c = devices[deviceID];
        if (c) {
            c.sendUTF(command);
        }
    }
}
