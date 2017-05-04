import 'meteor/theara:collection-cache';

// Collection
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment.js';
import {Vendors} from '../../imports/api/collections/vendor.js';

PurchaseOrderPayment.cacheTimestamp();
PurchaseOrderPayment.cacheDoc('vendor', Vendors, ['name', 'telephone', 'address']);

