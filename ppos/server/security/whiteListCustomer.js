import {WhiteListCustomer} from '../../imports/api/collections/whiteListCustomer.js';

// Lib
import './_init.js';

WhiteListCustomer.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
WhiteListCustomer.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
WhiteListCustomer.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
