import {PrepaidOrders} from '../../imports/api/collections/prepaidOrder.js';

// Lib
import './_init.js';

PrepaidOrders.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
PrepaidOrders.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
PrepaidOrders.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
