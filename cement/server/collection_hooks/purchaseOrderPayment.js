import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment';
import {Item} from '../../imports/api/collections/item.js';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js'
PurchaseOrderPayment.before.insert(function (userId, doc) {
    doc._id = idGenerator.genWithPrefix(PurchaseOrderPayment, `${doc.branchId}-`, 9);
});
PurchaseOrderPayment.after.remove(function (userId, doc) {
    Meteor.call('insertRemovedPoPayment', doc);
});