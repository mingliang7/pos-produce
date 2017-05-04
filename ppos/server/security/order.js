import {Order} from '../../imports/api/collections/order.js';

// Lib
import './_init.js';

Order.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Order.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Order.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
