import {Order} from '../../imports/api/collections/order.js';

// Lib
import './_init.js';

Order.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Order.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Order.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
