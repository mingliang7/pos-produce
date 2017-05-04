import 'meteor/theara:collection-cache';

// Collection
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';
import {Vendors} from '../../imports/api/collections/vendor.js';
import {Customers} from '../../imports/api/collections/customer.js';

PurchaseOrder.cacheTimestamp();
PurchaseOrder.cacheDoc('vendor', Vendors, ['name', 'telephone', 'address']);
PurchaseOrder.cacheDoc('customer', Customers, ['name', 'telephone', 'address']);
