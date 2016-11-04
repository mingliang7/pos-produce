import {Customers} from '../../imports/api/collections/customer.js';

// Lib
import './_init.js';

Customers.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Customers.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Customers.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
