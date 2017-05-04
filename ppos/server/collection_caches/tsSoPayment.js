import 'meteor/theara:collection-cache';

// Collection
import {TSSOPayment} from '../../imports/api/collections/tsSoPayment.js';
import {Customers} from '../../imports/api/collections/customer.js';

TSSOPayment.cacheTimestamp();
TSSOPayment.cacheDoc('customer', Customers, ['name']);

