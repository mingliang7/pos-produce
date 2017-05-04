import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {StockParents} from '../../imports/api/collections/stockParents.js';
StockParents.before.insert(function (userId, doc) {
    let prefix = doc.branchId;
    doc._id = idGenerator.genWithPrefix(StockParents, prefix, 3)
});
