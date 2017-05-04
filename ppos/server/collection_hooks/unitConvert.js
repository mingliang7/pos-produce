import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {UnitConvert} from '../../imports/api/collections/unitConvert.js';
UnitConvert.before.insert(function (userId, doc) {
    doc._id = idGenerator.gen(UnitConvert, 3);
});

