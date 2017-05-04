import {Vendors} from '../../imports/api/collections/vendor.js';

// Lib
import './_init.js';

Vendors.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Vendors.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Vendors.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
