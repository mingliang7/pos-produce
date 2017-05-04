import 'meteor/theara:collection-cache';

// Collection
import {TransferMoney} from '../../imports/api/collections/transferMoney.js';
import {Branch} from '../../../core/imports/api/collections/branch.js';
TransferMoney.cacheDoc('fromBranch',Branch,['enName', 'khName']);
TransferMoney.cacheDoc('toBranch',Branch,['enName', 'khName']);

