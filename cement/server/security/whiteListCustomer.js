import {WhiteListCustomer} from '../../imports/api/collections/whiteListCustomer.js';

// Lib
import './_init.js';

WhiteListCustomer.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
WhiteListCustomer.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
WhiteListCustomer.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
