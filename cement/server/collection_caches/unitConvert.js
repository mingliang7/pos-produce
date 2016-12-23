import 'meteor/theara:collection-cache';

// Collection
import {UnitConvert} from '../../imports/api/collections/unitConvert.js';
import {Units} from '../../imports/api/collections/units.js';
import {Item} from '../../imports/api/collections/item.js';
UnitConvert.cacheDoc('item',Item,['name', '_unit']);
UnitConvert.cacheDoc('unit',Units,['name'], 'convertUnit');
