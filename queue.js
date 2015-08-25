/**
 * Created By Thomas.
 * Date: 12-9-14
 * Time: 下午4:48
 * Queue Unit
 */
var context = require('rabbit.js').createContext('amqp://localhost');

var pub_business = context.socket('PUB');
var pub_database = context.socket('PUB');
var pub_command = context.socket('PUB');

context.on('ready', function () {
    pub_business.connect('business');
    pub_database.connect('database');
    pub_command.connect('command');
});

exports.sendToQueue = function (queueType, obj) {
    if (queueType == "business") {
        pub_business.write(JSON.stringify(obj), 'utf8');
    } else if (queueType == "database") {
        pub_database.write(JSON.stringify(obj), 'utf8');
    } else if (queueType == "command") {
        pub_command.write(JSON.stringify(obj), 'utf8');
    }
};
