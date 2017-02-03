import 'meteor/theara:collection-cache';

// Collection
import {TSPayment} from '../../imports/api/collections/tsPayment.js';
import {Customers} from '../../imports/api/collections/customer.js';

TSPayment.cacheTimestamp();
TSPayment.cacheDoc('customer', Customers, ['name']);

