import {ReceivePayment} from '../../imports/api/collections/receivePayment.js';

// Lib
import './_init.js';

ReceivePayment.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
ReceivePayment.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
ReceivePayment.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
