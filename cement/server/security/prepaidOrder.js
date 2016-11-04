import {PrepaidOrders} from '../../imports/api/collections/prepaidOrder.js';

// Lib
import './_init.js';

PrepaidOrders.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
PrepaidOrders.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
PrepaidOrders.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
