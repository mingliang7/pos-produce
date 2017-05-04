import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';

// Lib
import './_init.js';

PurchaseOrder.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
PurchaseOrder.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
PurchaseOrder.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
