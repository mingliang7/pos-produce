import {ProductCycle} from '../../imports/api/collections/productCycle.js';

// Lib
import './_init.js';

ProductCycle.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
ProductCycle.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
ProductCycle.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
