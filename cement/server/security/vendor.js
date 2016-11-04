import {Vendors} from '../../imports/api/collections/vendor.js';

// Lib
import './_init.js';

Vendors.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Vendors.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Vendors.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
