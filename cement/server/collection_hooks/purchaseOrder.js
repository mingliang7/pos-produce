import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js';
import {Vendors} from '../../imports/api/collections/vendor.js';

PurchaseOrder.before.insert(function (userId, doc) {
    let prefix = doc.vendorId;
    doc._id = idGenerator.genWithPrefix(PurchaseOrder, prefix, 6);
});

PurchaseOrder.after.insert(function (userId, doc) {
    //Account Integration
    let setting = AccountIntegrationSetting.findOne();
    if (setting && setting.integrate) {
        let transaction = [];
        let data = doc;
        data.type = "PurchaseOrder";
        let oweInventoryChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing PO'});
        let cashChartAccount = AccountMapping.findOne({name: 'A/P PO'});

        let vendorDoc = Vendors.findOne({_id: doc.vendorId});
        if (vendorDoc) {
            data.name = vendorDoc.name;
            data.des = data.des == "" || data.des == null ? ('កម្ម៉ង់ទំនិញពីក្រុមហ៊ុនៈ' + data.name) : data.des;
        }

        transaction.push({
                account: oweInventoryChartAccount.account,
                dr: doc.total,
                cr: 0,
                drcr: doc.total
            },
            {
                account: cashChartAccount.account,
                dr: 0,
                cr: doc.total,
                drcr: -doc.total
            });
        data.transaction = transaction;
        data.journalDate = data.purchaseOrderDate;
        Meteor.call('insertAccountJournal', data);
    }
    //End Account Integration
});


PurchaseOrder.after.update(function (userId, doc) {
    //Account Integration
    let setting = AccountIntegrationSetting.findOne();
    if (setting && setting.integrate) {
        let transaction = [];
        let data = doc;
        data.type = "PurchaseOrder";
        let oweInventoryChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing PO'});
        let cashChartAccount = AccountMapping.findOne({name: 'A/P PO'});

        let vendorDoc = Vendors.findOne({_id: doc.vendorId});
        if (vendorDoc) {
            data.name = vendorDoc.name;
            data.des = data.des == "" || data.des == null ? ('កម្ម៉ង់ទំនិញពីក្រុមហ៊ុនៈ' + data.name) : data.des;
        }

        transaction.push({
                account: oweInventoryChartAccount.account,
                dr: doc.total,
                cr: 0,
                drcr: doc.total
            },
            {
                account: cashChartAccount.account,
                dr: 0,
                cr: doc.total,
                drcr: -doc.total
            });
        data.transaction = transaction;
        data.journalDate = data.purchaseOrderDate;
        Meteor.call('updateAccountJournal', data);
    }
    //End Account Integration
});

PurchaseOrder.after.remove(function (userId, doc) {
    Meteor.defer(function () {
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let data = {_id: doc._id, type: 'PurchaseOrder'};
            Meteor.call('removeAccountJournal', data)
        }
    })

});
