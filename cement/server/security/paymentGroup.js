import {PaymentGroups} from '../../imports/api/collections/paymentGroup.js';

// Lib
import './_init.js';

PaymentGroups.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
PaymentGroups.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
PaymentGroups.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
