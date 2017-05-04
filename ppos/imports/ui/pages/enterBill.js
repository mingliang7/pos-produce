import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {_} from 'meteor/erasaur:meteor-lodash';
import 'meteor/theara:jsonview';
import {TAPi18n} from 'meteor/tap:i18n';
import 'meteor/tap:i18n-ui';


// Lib
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../../core/client/libs/display-alert.js';
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';
import RangeDate from '../../api/libs/date';
// Component
import '../../../../core/client/components/loading.js';
import '../../../../core/client/components/column-action.js';
import '../../../../core/client/components/form-footer.js';

// Collection
import {EnterBills} from '../../api/collections/enterBill.js';
import {Item} from '../../api/collections/item';
import {vendorBillCollection} from '../../api/collections/tmpCollection';
// Tabular
import {EnterBillTabular} from '../../../common/tabulars/enterBill.js';

// Page
import './enterBill.html';
import './enterBill-items.js';
import './info-tab.html';
import './vendor.html'
//methods
import {EnterBillInfo} from '../../../common/methods/enterBill.js'
import {vendorInfo} from '../../../common/methods/vendor.js';

//Tracker for vendor infomation
Tracker.autorun(function () {
    if (Session.get("getVendorId")) {
        vendorInfo.callPromise({_id: Session.get("getVendorId")})
            .then(function (result) {
                Session.set('vendorInfo', result);
            })
    }
});
// Declare template
let indexTmpl = Template.PPOS_enterBill,
    actionTmpl = Template.PPOS_enterBillAction,
    newTmpl = Template.PPOS_enterBillNew,
    editTmpl = Template.PPOS_enterBillEdit,
    showTmpl = Template.PPOS_enterBillShow,
    invoiceBillTmpl = Template.PPOS_invoiceBill,
    previewInvoiceItemTmpl = Template.PPOS_previewInvoiceItem;
// Local collection
let itemsCollection = new Mongo.Collection(null);

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('enterBill', {size: 'lg'});
    createNewAlertify('previewInvoiceItem', {size: 'lg'});
    createNewAlertify('enterBillShow', {size: 'lg'});
    createNewAlertify('vendor');
});

indexTmpl.helpers({
    tabularTable(){
        return EnterBillTabular;
    },
    selector() {
        return {status: {$ne: 'removed'}, branchId: Session.get('currentBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.enterBill(fa('plus', TAPi18n.__('ppos.enterBill.title')), renderTemplate(newTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        // alertify.enterBill(fa('pencil', TAPi18n.__('ppos.enterBill.title')), renderTemplate(editTmpl, this));
        let data = this;
        if (data.invoiceId == null) {
            Meteor.call('isBillHasRelation', data._id, function (error, result) {
                if (error) {
                    alertify.error(error.message);
                } else {
                    if (result) {
                        let msg = '';
                        if (data.billType == 'group') {
                            msg = `Please Check Group #${data.paymentGroupId}`;
                        }
                        swal(
                            'Cancelled',
                            `Data has been used. Can't update. ${msg}`,
                            'error'
                        );
                    } else {
                        alertify.enterBill(fa('pencil', TAPi18n.__('ppos.enterBill.title')), renderTemplate(editTmpl, data));
                    }
                }
            });
        } else {
            swal(
                'Cancelled',
                `Can't update. Invoices will miss the reference to this Bill.`,
                'error'
            );
        }

    },
    'click .js-destroy' (event, instance) {
        let data = this;
        Meteor.call('isBillHasRelation', data._id, function (error, result) {
            if (error) {
                alertify.error(error.message);
            } else {
                if (result) {
                    let msg = '';
                    if (data.billType == 'group') {
                        msg = `Please Check Group #${data.paymentGroupId}`;
                    }
                    swal(
                        'Cancelled',
                        `Data has been used. Can't remove. ${msg}`,
                        'error'
                    );

                } else {
                    destroyAction(
                        EnterBills,
                        {_id: data._id},
                        {title: TAPi18n.__('ppos.enterBill.title'), itemTitle: data._id}
                    );
                }
            }
        });
    },
    'click .js-display' (event, instance) {
        swal({
            title: "Pleas Wait",
            text: "Getting Invoices....", showConfirmButton: false
        });
        Meteor.call('previewEnterBill', {_id: this._id}, function (err, result) {
            swal.close();
            alertify.enterBillShow(fa('eye', 'Show EnterBill'), renderTemplate(showTmpl, result));
        });
    },
    'click .js-enterBill' (event, instance) {
        let params = {};
        let queryParams = {enterBillId: this._id};
        let path = FlowRouter.path("ppos.enterBillReportGen", params, queryParams);

        window.open(path, '_blank');
    }
});
indexTmpl.onDestroyed(function () {
    vendorBillCollection.remove({});
});
newTmpl.onCreated(function () {
    this.repOptions = new ReactiveVar();
    Meteor.call('getRepList', (err, result) => {
        this.repOptions.set(result);
    });
});
// New
newTmpl.onRendered(function () {
    RangeDate.checkMinPlusOneDay($('[name="enterBillDate"]'));
    RangeDate.checkMinPlusOneDay($('[name="dueDate"]'));
});
newTmpl.events({
    'change [name=vendorId]'(event, instance){
        if (event.currentTarget.value != '') {
            Session.set('getVendorId', event.currentTarget.value);
            if (FlowRouter.query.get('vendorId')) {
                FlowRouter.query.set('vendorId', event.currentTarget.value);
            }
        }
        Session.set('totalOrder', undefined);
    },
    'click .go-to-pay-bill'(event, instance){
        alertify.enterBill().close();
    }
});
newTmpl.helpers({
    totalOrder(){
        let total = 0;
        if (!FlowRouter.query.get('vendorId')) {
            itemsCollection.find().forEach(function (item) {
                total += item.amount;
            });
        }
        if (Session.get('totalOrder')) {
            let totalOrder = Session.get('totalOrder');
            return totalOrder;
        }
        return {total};
    },
    options(){
        let instance = Template.instance();
        if (instance.repOptions.get() && instance.repOptions.get().repList) {
            return instance.repOptions.get().repList
        }
        return '';
    },
    repId(){
        try {
            let {vendorInfo} = Session.get('vendorInfo');
            if (vendorInfo) {
                return vendorInfo.repId;
            }
            return '';
        } catch (e) {

        }
    },
    termId(){
        try {
            let {vendorInfo} = Session.get('vendorInfo');
            if (vendorInfo) {

                return vendorInfo.termId;

            }
            return '';
        } catch (e) {

        }
    },
    totalEnterBill(){
        let total = 0;
        itemsCollection.find().forEach(function (item) {
            total += item.amount;
        });
        return total;
    },
    vendorInfo() {
        try {
            let {vendorInfo, totalAmountDue} = Session.get('vendorInfo');
            if (!vendorInfo) {
                return {empty: true, message: 'No data available'}
            }

            return {
                // <li><i class="fa fa-credit-card" aria-hidden="true"></i> Credit Limit: <span class="label label-warning">${vendorInfo.creditLimit ? numeral(vendorInfo.creditLimit).format('0,0.00') : 0}</span> | </li>
                fields: `<li><i class="fa fa-phone-square"></i> Phone: <b><span class="label label-success">${vendorInfo.telephone ? vendorInfo.telephone : ''}</span></b> | </li>
              <!--<li>Opening Balance: <span class="label label-success">0</span></li>-->
              <li><i class="fa fa-money"></i> Balance: <span class="label label-primary">${numeral(totalAmountDue).format('0,0.00')}</span> |
              <li><i class="fa fa-home"></i> Address: <b>${vendorInfo.address ? vendorInfo.address : 'None'}</b>`

            };
        } catch (e) {
        }
    },
    collection(){
        return EnterBills;
    },
    itemsCollection(){
        return itemsCollection;
    },
    disabledSubmitBtn: function () {
        let cont = itemsCollection.find().count();
        if (cont == 0) {
            return {disabled: true};
        }

        return {};
    },
    disabledPayBtn(){
        let cont = itemsCollection.find().count();
        let pay = $('[name="paidAmount"]').val();
        if (cont == 0 || pay == "") {
            return {disabled: true};
        }
        return {};
    },
    isTerm(){
        try {
            let {vendorInfo} = Session.get('vendorInfo');
            if (vendorInfo) {
                if (vendorInfo._term) {
                    return true;
                }
                return false;
            }
        } catch (e) {
        }
    },
    dueDate(){
        try {
            let date = AutoForm.getFieldValue('enterBillDate');
            let {vendorInfo} = Session.get('vendorInfo');
            if (vendorInfo) {
                if (vendorInfo._term) {
                    let term = vendorInfo._term;

                    let dueDate = moment(date).add(term.netDueIn, 'days').toDate();
                    console.log(dueDate);
                    return dueDate;
                }
            }
            return date;
        } catch (e) {
        }
    }
});

newTmpl.onDestroyed(function () {
    // Remove items collection
    itemsCollection.remove({});
    Session.set('vendorInfo', undefined);
    Session.set('vendorId', undefined);
    Session.set('getVendorId', undefined);
    FlowRouter.query.unset();
    Session.set('totalOrder', undefined);
});
// Edit
editTmpl.onCreated(function () {
    this.repOptions = new ReactiveVar();
    Meteor.call('getRepList', (err, result) => {
        this.repOptions.set(result);
    });
});
editTmpl.onRendered(function () {
    RangeDate.checkMinPlusOneDay($('[name="enterBillDate"]'));
    RangeDate.checkMinPlusOneDay($('[name="dueDate"]'));
});
editTmpl.events({

    'click .add-new-vendor'(event, instance){
        alertify.vendor(fa('plus', 'New Vendor'), renderTemplate(Template.PPOS_vendorNew));
    },
    'click .go-to-pay-bill'(event, instance){
        alertify.invoice().close();
    },
    'change [name=vendorId]'(event, instance){
        if (event.currentTarget.value != '') {
            Session.set('getVendorId', event.currentTarget.value);
            if (FlowRouter.query.get('vendorId')) {
                FlowRouter.query.set('vendorId', event.currentTarget.value);
            }
        }
        Session.set('totalOrder', undefined);
    },
    'change [name="termId"]'(event, instance){
        let vendorInfo = Session.get('vendorInfo');
        Meteor.call('getTerm', event.currentTarget.value, function (err, result) {
            vendorInfo._term.netDueIn = result.netDueIn;
            Session.set('vendorInfo', vendorInfo);
        });
    }
});
editTmpl.helpers({
    closeSwal(){
        setTimeout(function () {
            swal.close();
        }, 500);
    },
    collection(){
        return EnterBills;
    },
    data () {
        let data = this;
        // Add items to local collection
        _.forEach(data.items, (value) => {
            Meteor.call('getItem', value.itemId, function (err, result) {
                value.name = result.name;
                itemsCollection.insert(value);
            })
        });

        return data;
    },
    itemsCollection(){
        return itemsCollection;
    },
    disabledSubmitBtn: function () {
        let cont = itemsCollection.find().count();
        if (cont == 0) {
            return {disabled: true};
        }

        return {};
    },
    repId(){
        let {vendorInfo} = Session.get('vendorInfo');
        if (vendorInfo) {
            try {
                return vendorInfo.repId;
            } catch (e) {

            }
        }
        return '';
    },
    termId(){
        let {vendorInfo} = Session.get('vendorInfo');
        if (vendorInfo) {
            try {
                return vendorInfo.termId;
            } catch (e) {

            }
        }
        return '';
    },
    options(){
        let instance = Template.instance();
        if (instance.repOptions.get() && instance.repOptions.get().repList) {
            return instance.repOptions.get().repList
        }
        return '';
    },
    termOption(){
        let instance = Template.instance();
        if (instance.repOptions.get() && instance.repOptions.get().termList) {
            return instance.repOptions.get().termList
        }
        return '';
    },
    totalOrder(){
        let total = 0;
        if (!FlowRouter.query.get('vendorId')) {
            itemsCollection.find().forEach(function (item) {
                total += item.amount;
            });
        }
        if (Session.get('totalOrder')) {
            let totalOrder = Session.get('totalOrder');
            return totalOrder;
        }
        return {total};
    },
    vendorInfo() {
        let {vendorInfo} = Session.get('vendorInfo');
        if (!vendorInfo) {
            return {empty: true, message: 'No data available'}
        }

        return {
            fields: `<li>Phone: <b>${vendorInfo.telephone ? vendorInfo.telephone : ''}</b></li>
              <li>Opening Balance: <span class="label label-success">0</span></li>
              <li >Credit Limit: <span class="label label-warning">${vendorInfo.creditLimit ? numeral(vendorInfo.creditLimit).format('0,0.00') : 0}</span></li>
              <li>Prepaid Order to be invoice: <span class="label label-primary">0</span>`
        };
    },
    dueDate(){
        let date = AutoForm.getFieldValue('enterBillDate');
        let {vendorInfo} = Session.get('vendorInfo');
        if (vendorInfo) {
            if (vendorInfo._term) {
                let term = vendorInfo._term;
                let dueDate = moment(date).add(term.netDueIn, 'days').toDate();
                return dueDate;
            }
        }
        return date;
    },
    isTerm(){
        let {vendorInfo} = Session.get('vendorInfo');
        if (vendorInfo) {
            if (vendorInfo._term) {
                return true;
            }
            return false;
        }
    }
});

editTmpl.onDestroyed(function () {
    // Remove items collection
    itemsCollection.remove({});
});

// Show
showTmpl.onCreated(function () {

});

showTmpl.helpers({
    company(){
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        return doc.company;
    },
    // colorizeType(type) {
    //     if (type == 'term') {
    //         return `<label class="label label-info">T</label>`
    //     }
    //     return `<label class="label label-success">G</label>`
    // },
    colorizeStatus(status){
        if (status == 'active') {
            return `<label class="label label-info">A</label>`
        } else if (status == 'partial') {
            return `<label class="label label-danger">P</label>`
        }
        return `<label class="label label-success">C</label>`
    }
});
showTmpl.events({
    'click .print-bill-show'(event, instance){
        $('#to-print').printThis();
    }
});

invoiceBillTmpl.onCreated(function () {
});
invoiceBillTmpl.helpers({
    schema(){
        return InvoiceBillSchema;
    }
});
invoiceBillTmpl.events({
    'change [name="invoiceId"]'(event, instance){
        let invoiceIds = $("[name='invoiceId']").val();
        let ids = invoiceIds == null ? [] : invoiceIds;
        itemsCollection.remove({});
        Meteor.call('groupInvoiceItemByPrice', {selector: {_id: {$in: ids}}}, function (err, result) {
            if (result) {
                if (result.items.length > 0) {
                    result.items.forEach(function (item) {
                        item.originalPrice = item.price;
                        item.isBill = true;
                        itemsCollection.insert(item);
                    });
                }
            }
        });
        if (invoiceIds) {
            $('.items-header').addClass('hidden');
            Meteor.setTimeout(function () {
                $('.js-destroy-item').addClass('hidden');
                $('.item-qty').attr('readonly', true);
            }, 500);
        } else {
            $('.items-header').removeClass('hidden');
            $('.item-qty').attr('readonly', false);
        }
        if (invoiceIds && invoiceIds.length > 0) {
            Meteor.call('getMinimumDateFromInvoice', invoiceIds, (err, result) => {
                if (!err) {
                    dpChange($('[name="enterBillDate"]'), result);
                }
            });
        } else {
            dpChange($('[name="enterBillDate"]'), null);
        }

    },
    'click .addInvoiceId'(event, instance){
        let invoiceIds = $("[name='invoiceId']").val();
        itemsCollection.remove({});
        let ids = invoiceIds == null ? [] : invoiceIds;
        Meteor.call('groupInvoiceItemByPrice', {selector: {_id: {$in: ids}}}, function (err, result) {
            if (result) {
                if (result.items.length > 0) {
                    result.items.forEach(function (item) {
                        item.originalPrice = item.price;
                        item.isBill = true;
                        itemsCollection.insert(item);
                    });
                }
            }
        });
    },
    'click .previewInvoiceItem'(event, insance){
        let invoiceIds = $("[name='invoiceId']").val();
        Meteor.call('groupInvoiceItemByPrice', {selector: {_id: {$in: invoiceIds}}}, function (err, result) {
            alertify.previewInvoiceItem(fa('', `Preview Item INV: ${invoiceIds && invoiceIds.join(', ')}`), renderTemplate(previewInvoiceItemTmpl, result));
        });

    }
});
// Hook
let hooksObject = {
    before: {
        insert: function (doc) {
            let items = [];
            itemsCollection.find().forEach((obj) => {
                delete obj._id;
                items.push(obj);
            });
            doc.status = 'active';
            doc.items = items;
            return doc;
        },
        update: function (doc) {
            let items = [];
            itemsCollection.find().forEach((obj) => {
                delete obj._id;
                items.push(obj);
            });
            doc.$set.items = items;
            delete doc.$unset;
            return doc;
        }
    },
    onSuccess (formType, id) {
        // if (formType == 'update') {
        // Remove items collection
        itemsCollection.remove({});
        if (formType != 'update') {
            if (!FlowRouter.query.get('vendorId')) {
                Meteor.call('getBillId', id, function (err, result) {
                    if (result) {
                        Session.set('totalOrder', result);
                    }
                });
            } else {
                alertify.enterBill().close();
            }
        } else {
            alertify.enterBill().close();
        }
        // }
        Session.set('getVendorId', undefined);
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'PPOS_enterBillNew',
    'PPOS_enterBillEdit'
], hooksObject);


function excuteEditForm(doc) {
    swal({
        title: "Pleas Wait",
        text: "Getting Invoices....", showConfirmButton: false
    });
    alertify.invoice(fa('pencil', TAPi18n.__('ppos.invoice.title')), renderTemplate(editTmpl, doc)).maximize();
}
function dpChange(elem, doc) {
    elem.data("DateTimePicker").minDate(doc ? moment(doc.invoiceDate).startOf('days').toDate() : false);
}