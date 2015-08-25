/**
 * Created by Thomas on 15/8/25.
 * Open Message Transfer Protocol Unit
 */
var def = require('./define');

function padLeft(number,length,char){
    return (Array(length).join(char||"0")+number).slice(-length);
}

function OMTP(content){
    this.content = content;
    this.message_type = -1;
    this.header_length = 0;
    this.header = "";
    this.payload_length = 0;
    this.payload = "";
    this.seq = 0;
}

OMTP.prototype.unwrap = function(){
    var cmd = this.content.substr(0, MESSAGE_TYPE_LEN);
    this.message_type = this.getMsgType(cmd);
    switch (this.message_type){
        case def.OMTP_MSGU:
            this.header_length = parseInt(this.content.substr(MESSAGE_TYPE_LEN, HEADER_LEN));
            this.header = this.content.substr(MESSAGE_TYPE_LEN + HEADER_LEN, this.header_length);
            this.payload_length = parseInt(this.content.substr(MESSAGE_TYPE_LEN + HEADER_LEN + this.header_length, PAYLOAD_LEN));
            this.payload =  this.content.substr(MESSAGE_TYPE_LEN + HEADER_LEN + this.header_length + PAYLOAD_LEN, this.payload_length);
            this.seq = parseInt(this.content.substr(MESSAGE_TYPE_LEN + HEADER_LEN + this.header_length + PAYLOAD_LEN + this.payload_length, SEQ_LEN));
            break;
        case def.OMTP_MSIM, def.OMTP_MSGB, def.OMTP_CLOS, def.OMTP_PING:
            this.payload_length = parseInt(this.content.substr(MESSAGE_TYPE_LEN, PAYLOAD_LEN));
            this.payload =  this.content.substr(MESSAGE_TYPE_LEN + PAYLOAD_LEN, this.payload_length);
            this.seq = parseInt(this.content.substr(MESSAGE_TYPE_LEN + PAYLOAD_LEN + this.payload_length, SEQ_LEN));
            break;
        default:
            break;
    }
};

OMTP.prototype.wrap = function(){
    var cmd = this.getCmd(this.message_type);
    switch (this.message_type){
        case def.OMTP_MSGD, def.OMTP_PONG, def.OMTP_CONN:
            this.content = cmd + padLeft(this.payload_length, PAYLOAD_LEN) + this.payload + padLeft(this.seq, SEQ_LEN) + "0000";
            break;
        case def.OMTP_OK, def.OMTP_FAIL:
            this.content = cmd + padLeft(this.seq, SEQ_LEN) + "0000";
            break;

    }
    return this.content;
};

OMTP.prototype.getMsgType = function(cmd){
    var msg_type = -1;
    if(cmd == "MSIM"){
        msg_type = def.OMTP_MSIM;
    }else if(cmd == "MSGU"){
        msg_type = def.OMTP_MSGU;
    }else if(cmd == "MSGU"){
        msg_type = def.OMTP_MSGU;
    }else if(cmd == "MSGD"){
        msg_type = def.OMTP_MSGD;
    }else if(cmd == "MSGB"){
        msg_type = def.OMTP_MSGB;
    }else if(cmd == "CLOS"){
        msg_type = def.OMTP_CLOS;
    }else if(cmd == "PING"){
        msg_type = def.OMTP_PING;
    }else if(cmd == "PONG"){
        msg_type = def.OMTP_PONG;
    }else if(cmd == "CONN"){
        msg_type = def.OMTP_CONN;
    }else if(cmd == "OKOK"){
        msg_type = def.OMTP_OK;
    }else if(cmd == "FAIL"){
        msg_type = def.OMTP_FAIL;
    }
    return msg_type;
};

OMTP.prototype.getCmd = function(message_type){
    var cmd = "";
    switch (message_type){
        case def.OMTP_MSGD:
            cmd = "MSGD";
            break;
        case def.OMTP_PONG:
            cmd = "PONG";
            break;
        case def.OMTP_CONN:
            cmd = "CONN";
            break;
        case def.OMTP_OK:
            cmd = "OKOK";
            break;
        case def.OMTP_FAIL:
            cmd = "FAIL";
            break;

    }
    return cmd;
};

exports.OMTP = OMTP;
