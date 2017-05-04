import {PaymentGroups} from '../../imports/api/collections/paymentGroup.js';

// Lib
import './_init.js';

PaymentGroups.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
PaymentGroups.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
PaymentGroups.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
