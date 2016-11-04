import {ReceivePayment} from '../../imports/api/collections/receivePayment.js';

// Lib
import './_init.js';

ReceivePayment.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
ReceivePayment.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
ReceivePayment.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
