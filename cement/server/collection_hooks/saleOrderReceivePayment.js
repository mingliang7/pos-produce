import {SaleOrderReceivePayment} from '../../imports/api/collections/saleOrderReceivePayment'

SaleOrderReceivePayment.before.insert(function (userId, doc) {
    doc._id = idGenerator.genWithPrefix(SaleOrderReceivePayment, `${doc.branchId}-`, 9);
});

SaleOrderReceivePayment.after.remove(function (userId, doc) {
    Meteor.call('insertRemovedSoPayment', doc);
});