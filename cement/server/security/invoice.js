import {Invoices} from '../../imports/api/collections/invoice.js';

// Lib
import './_init.js';

Invoices.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Invoices.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Invoices.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
