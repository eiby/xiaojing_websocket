/**
 * Created by 1 on 15/8/26.
 * define some const
 */
//上行指令
exports.OMTP_MSIM = 0x0001;
exports.OMTP_MSGU = 0x0002;
exports.OMTP_MSGB = 0x0003;
exports.OMTP_CLOS = 0x8004;
exports.OMTP_PING = 0x8005;

//下行指令
exports.OMTP_MSGD = 0x8001;
exports.OMTP_PONG = 0x8002;
exports.OMTP_CONN = 0x8003;

//响应指令
exports.OMTP_OK = 0x0000;
exports.OMTP_FAIL = 0x000;

//字段长度定义
exports.MESSAGE_TYPE_LEN = 4;
exports.HEADER_LEN = 4;
exports.PAYLOAD_LEN = 4;
exports.SEQ_LEN = 4;
exports.CHECKSUM_LEN = 4;

//全局seq
global.omtp_seq = 0;