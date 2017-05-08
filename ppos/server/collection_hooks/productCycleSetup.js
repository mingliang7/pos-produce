import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {ProductCycleSetup} from '../../imports/api/collections/productCycleSetup.js';

ProductCycleSetup.before.insert(function (userId, doc) {
    doc._id = idGenerator.gen(ProductCycleSetup,3);
});


