import {Customers} from '../../imports/api/collections/customer.js';

// Lib
import './_init.js';

Customers.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Customers.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Customers.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
