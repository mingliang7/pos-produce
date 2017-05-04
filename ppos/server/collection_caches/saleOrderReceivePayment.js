import 'meteor/theara:collection-cache';

// Collection
import {SaleOrderReceivePayment} from '../../imports/api/collections/saleOrderReceivePayment.js';
import {Customers} from '../../imports/api/collections/customer.js';

SaleOrderReceivePayment.cacheTimestamp();
SaleOrderReceivePayment.cacheDoc('customer', Customers, ['name']);

