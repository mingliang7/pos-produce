import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';

// Lib
import './_init.js';

PurchaseOrder.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
PurchaseOrder.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
PurchaseOrder.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
