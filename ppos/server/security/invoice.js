import {Invoices} from '../../imports/api/collections/invoice.js';

// Lib
import './_init.js';

Invoices.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Invoices.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Invoices.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
