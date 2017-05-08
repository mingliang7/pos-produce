import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {ProductCycle} from '../../imports/api/collections/productCycle.js';

ProductCycle.before.insert(function (userId, doc) {
    let prefix = doc.branchId;
    doc._id = idGenerator.genWithPrefix(ProductCycle,prefix,9);
});


