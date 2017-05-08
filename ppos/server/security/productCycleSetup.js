import {ProductCycleSetup} from '../../imports/api/collections/productCycleSetup.js';

// Lib
import './_init.js';

ProductCycleSetup.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
ProductCycleSetup.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
ProductCycleSetup.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
