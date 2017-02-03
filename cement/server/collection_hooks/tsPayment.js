import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';
import {TSPayment} from '../../imports/api/collections/tsPayment';
import {Invoices} from '../../imports/api/collections/invoice';
import {GroupInvoice} from '../../imports/api/collections/groupInvoice';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js';
import {Customers} from '../../imports/api/collections/customer.js';

TSPayment.before.insert(function (userId, doc) {
    doc._id = idGenerator.genWithPrefix(TSPayment, `${doc.branchId}-`, 9);
});
// TSpayment.after.insert(function (userId, doc) {
//     Meteor.defer(function () {
//         //Account Integration
//         let setting = AccountIntegrationSetting.findOne();
//         if (setting && setting.integrate) {
//             let transaction = [];
//             let data = doc;
//             data.type = "TSpayment";
//             let arChartAccount = AccountMapping.findOne({name: 'A/R'});
//             let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
//             let saleDiscountChartAccount = AccountMapping.findOne({name: 'Sale Discount'});
//             let codChartAccount = AccountMapping.findOne({name: 'Customer COD'});
//             let benefitChartAccount = AccountMapping.findOne({name: 'Customer Benefit'});
//
//             let discount = doc.discount == null ? 0 : doc.discount;
//             let cod = doc.cod == null ? 0 : doc.cod;
//             let benefit = doc.benefit == null ? 0 : doc.benefit;
//             data.total = doc.paidAmount + discount + cod + benefit;
//             //let discountAmount = doc.dueAmount * doc.discount / 100;
//             //data.total = doc.paidAmount + discountAmount;
//
//             let customerDoc = Customers.findOne({_id: doc.customerId});
//             if (customerDoc) {
//                 data.name = customerDoc.name;
//                 data.des = data.des == "" || data.des == null ? ('ទទួលការបង់ប្រាក់ពីអតិថិជនៈ ' + data.name) : data.des;
//             }
//
//             transaction.push({
//                 account: cashChartAccount.account,
//                 dr: doc.paidAmount,
//                 cr: 0,
//                 drcr: doc.paidAmount
//             });
//             if (discount > 0) {
//                 transaction.push({
//                     account: saleDiscountChartAccount.account,
//                     dr: discount,
//                     cr: 0,
//                     drcr: discount
//                 });
//             }
//             if (cod > 0) {
//                 transaction.push({
//                     account: codChartAccount.account,
//                     dr: cod,
//                     cr: 0,
//                     drcr: cod
//                 });
//             }
//             if (benefit > 0) {
//                 transaction.push({
//                     account: benefitChartAccount.account,
//                     dr: benefit,
//                     cr: 0,
//                     drcr: benefit
//                 });
//             }
//
//             transaction.push({
//                 account: arChartAccount.account,
//                 dr: 0,
//                 cr: data.total,
//                 drcr: -data.total
//             });
//             data.transaction = transaction;
//             data.journalDate = data.paymentDate;
//             Meteor.call('insertAccountJournal', data);
//         }
//         //End Account Integration
//     });
// });
//
// TSpayment.after.update(function (userId, doc) {
//     let preDoc = this.previous;
//     let selector = {};
//     let type = {
//         term: doc.paymentType == 'term',
//         group: doc.paymentType == 'group'
//     };
//     if (doc.balanceAmount > 0) {
//         TSpayment.direct.update(doc._id, {$set: {status: 'partial'}});
//         if (type.term) {
//             selector.$set = {status: 'partial'};
//             updateInvoiceOrInvoiceGroup({_id: doc.invoiceId, selector, collection: Invoices});
//         } else {
//             selector.$set = {status: 'partial'};
//             updateInvoiceOrInvoiceGroup({_id: doc.invoiceId, selector, collection: GroupInvoice});
//         }
//     } else if (doc.balanceAmount < 0) {
//         TSpayment.direct.update(doc._id, {$set: {status: 'closed', paidAmount: doc.dueAmount, balanceAmount: 0}});
//         if (type.term) {
//             selector.$set = {status: 'closed'};
//             updateInvoiceOrInvoiceGroup({_id: doc.invoiceId, selector, collection: Invoices});
//         } else {
//             selector.$set = {status: 'closed'};
//             updateInvoiceOrInvoiceGroup({_id: doc.invoiceId, selector, collection: GroupInvoice});
//         }
//     }
//     else {
//         TSpayment.direct.update(doc._id, {$set: {status: 'closed'}});
//         if (type.term) {
//             selector.$set = {status: 'closed'};
//             updateInvoiceOrInvoiceGroup({_id: doc.invoiceId, selector, collection: Invoices});
//         } else {
//             selector.$set = {status: 'closed'};
//             updateInvoiceOrInvoiceGroup({_id: doc.invoiceId, selector, collection: GroupInvoice});
//         }
//     }
//     Meteor.defer(function () {
//         //Account Integration
//         let setting = AccountIntegrationSetting.findOne();
//         if (setting && setting.integrate) {
//             let transaction = [];
//             let data = doc;
//             data.type = "TSpayment";
//             let arChartAccount = AccountMapping.findOne({name: 'A/R'});
//             let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
//             let saleDiscountChartAccount = AccountMapping.findOne({name: 'Sale Discount'});
//             let codChartAccount = AccountMapping.findOne({name: 'Customer COD'});
//             let benefitChartAccount = AccountMapping.findOne({name: 'Customer Benefit'});
//
//             let discount = doc.discount == null ? 0 : doc.discount;
//             let cod = doc.cod == null ? 0 : doc.cod;
//             let benefit = doc.benefit == null ? 0 : doc.benefit;
//             data.total = doc.paidAmount + discount + cod + benefit;
//
//             let customerDoc = Customers.findOne({_id: doc.customerId});
//             if (customerDoc) {
//                 data.name = customerDoc.name;
//                 data.des = data.des == "" || data.des == null ? ('ទទួលការបង់ប្រាក់ពីអតិថិជនៈ ' + data.name) : data.des;
//             }
//
//             transaction.push({
//                 account: cashChartAccount.account,
//                 dr: doc.paidAmount,
//                 cr: 0,
//                 drcr: doc.paidAmount
//             });
//             if (discount > 0) {
//                 transaction.push({
//                     account: saleDiscountChartAccount.account,
//                     dr: discount,
//                     cr: 0,
//                     drcr: discount
//                 });
//             }
//             if (cod > 0) {
//                 transaction.push({
//                     account: codChartAccount.account,
//                     dr: cod,
//                     cr: 0,
//                     drcr: cod
//                 });
//             }
//             if (benefit > 0) {
//                 transaction.push({
//                     account: benefitChartAccount.account,
//                     dr: benefit,
//                     cr: 0,
//                     drcr: benefit
//                 });
//             }
//             transaction.push({
//                 account: arChartAccount.account,
//                 dr: 0,
//                 cr: data.total,
//                 drcr: -data.total
//             });
//             data.transaction = transaction;
//             data.journalDate = data.paymentDate;
//             Meteor.call('updateAccountJournal', data);
//         }
//         //End Account Integration
//     });
// });
//
TSPayment.after.remove(function (userId, doc) {
    Meteor.call('insertRemovedTsPayment', doc);
    // Meteor.defer(function () {
    //     //Account Integration
    //     let setting = AccountIntegrationSetting.findOne();
    //     if (setting && setting.integrate) {
    //         let data = {_id: doc._id, type: 'TSPayment'};
    //         Meteor.call('removeAccountJournal', data);
    //     }
    //     //End Account Integration
    // })
});
function updateInvoiceOrInvoiceGroup({_id, selector, collection}) {
    collection.direct.update(_id, selector);
}
