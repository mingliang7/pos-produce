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

// Component
import '../../../../core/client/components/loading.js';
import '../../../../core/client/components/column-action.js';
import '../../../../core/client/components/form-footer.js';

// Collection
import {LendingStocks} from '../../api/collections/lendingStock.js';
import {Item} from '../../api/collections/item';
// Tabular
import {LendingStockTabular} from '../../../common/tabulars/lendingStock.js';

// Page
import './lendingStock.html';
import './lendingStock-items.js';
import './info-tab.html';
//methods
import {LendingStockInfo} from '../../../common/methods/lendingStock.js'
import {vendorInfo} from '../../../common/methods/vendor.js';
//Tracker for vendor infomation
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
let indexTmpl = Template.PPOS_lendingStock,
    actionTmpl = Template.PPOS_lendingStockAction,
    newTmpl = Template.PPOS_lendingStockNew,
    editTmpl = Template.PPOS_lendingStockEdit,
    showTmpl = Template.PPOS_lendingStockShow;
// Local collection
let itemsCollection = new Mongo.Collection(null);

indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('lendingStock', {size: 'lg'});
    createNewAlertify('lendingStockShow', {size: 'lg'});
    createNewAlertify('vendor');
});

indexTmpl.helpers({
    tabularTable(){
        return LendingStockTabular;
    },
    selector() {
        return {status: {$ne: 'removed'}, branchId: Session.get('currentBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.lendingStock(fa('plus', TAPi18n.__('ppos.lendingStock.title')), renderTemplate(newTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        var data = this;
        Meteor.call('isLendingStockHasRelation', data._id, function (error, result) {
            if (error) {
                alertify.error(error.message);
            } else {
                if (result) {
                    swal('បញ្ជាក់!', `សូមធ្វើការលុប Receive Item លេខ​ ${result} ជាមុនសិន!​​​​`, 'error');
                } else {
                    alertify.lendingStock(fa('pencil', TAPi18n.__('ppos.lendingStock.title')), renderTemplate(editTmpl, data));

                }
            }
        });
    },
    'click .js-destroy' (event, instance) {
        var id = this._id;
        Meteor.call('isLendingStockHasRelation', id, function (error, result) {
            if (error) {
                alertify.error(error.message);
            } else {
                if (result) {
                    swal('បញ្ជាក់!', `សូមធ្វើការលុប Receive Item លេខ​ ${result} ជាមុនសិន!​​​​`, 'error');
                } else {
                    destroyAction(
                        LendingStocks,
                        {_id: id},
                        {title: TAPi18n.__('ppos.lendingStock.title'), itemTitle: id}
                    );
                }
            }
        });
    },
    'click .js-display' (event, instance) {
        Meteor.call('lendingStockShow', {_id: this._id}, function (err, result) {
            if (result) {
                alertify.lendingStockShow(fa('eye', TAPi18n.__('ppos.lendingStock.title')), renderTemplate(showTmpl, result));
            }
        });
    },
    'click .js-lendingStock' (event, instance) {
        let params = {};
        let queryParams = {lendingStockId: this._id};
        let path = FlowRouter.path("ppos.lendingStockReportGen", params, queryParams);

        window.open(path, '_blank');
    }
});
newTmpl.onCreated(function () {
    this.repOptions = new ReactiveVar();
    Meteor.call('getRepList', (err, result) => {
        this.repOptions.set(result);
    });
});
// New
newTmpl.events({
    'click #btn-save-print'(event, instance){
        Session.set('btnType', 'save-print');
    },
    'click #btn-save'(event, instance){
        Session.set('btnType', 'save');
    },
    'click #btn-pay'(event, instance){
        Session.set('btnType', 'pay');
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
        if (Session.get('vendorInfo')) {
            try {
                return Session.get('vendorInfo').repId;
            } catch (e) {

            }
        }
        return '';
    },
    totalLendingStock(){
        let total = 0;
        itemsCollection.find().forEach(function (item) {
            total += item.amount;
        });
        return total;
    },
    vendorInfo() {
        let vendorInfo = Session.get('vendorInfo');
        if (!vendorInfo) {
            return {empty: true, message: 'No data available'}
        }

        return {
            fields: `<li>Phone: <b>${vendorInfo.telephone ? vendorInfo.telephone : ''}</b></li>
              <li>Opening Balance: <span class="label label-success">0</span></li>
              <li >Credit Limit: <span class="label label-warning">${vendorInfo.creditLimit ? numeral(vendorInfo.creditLimit).format('0,0.00') : 0}</span></li>
              <li>Prepaid Order to be lendingStock: <span class="label label-primary">0</span>`
        };
    },
    collection(){
        return LendingStocks;
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

});

newTmpl.onDestroyed(function () {
     ;
    // Remove items collection
    itemsCollection.remove({});
    Session.set('vendorInfo', undefined);
    Session.set('vendorId', undefined);
    FlowRouter.query.unset();
    Session.set('prepaidOrderItems', undefined);
    Session.set('totalOrder', undefined);
});
// Edit
editTmpl.onCreated(function () {
    this.repOptions = new ReactiveVar();
    this.isPrepaidOrder = new ReactiveVar(false);
    Meteor.call('getRepList', (err, result) => {
        this.repOptions.set(result);
    });
    if (this.data.billType == 'prepaidOrder') {
        FlowRouter.query.set('vendorId', this.data.vendorId);
        this.isPrepaidOrder.set(true);
    }
});
editTmpl.events({
    'click #btn-save-print'(event, instance){
        Session.set('btnType', 'save-print');
    },
    'click #btn-save'(event, instance){
        Session.set('btnType', 'save');
    },
    'click #btn-pay'(event, instance){
        Session.set('btnType', 'pay');
    },
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
    'click .toggle-list'(event, instance){
        alertify.listPrepaidOrder(fa('', 'Prepaid Order'), renderTemplate(listPrepaidOrder));
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
    isPrepaidOrder(){
        return Template.instance().isPrepaidOrder.get();
    },
    collection(){
        return LendingStocks;
    },
    data () {
        let data = this;
        // Add items to local collection
        _.forEach(data.items, (value)=> {
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
        if (Session.get('vendorInfo')) {
            try {
                return Session.get('vendorInfo').repId;
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
        let vendorInfo = Session.get('vendorInfo');
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
    repId(){
        if (Session.get('vendorInfo')) {
            return Session.get('vendorInfo').repId;
        }
    },

});

editTmpl.onDestroyed(function () {
     ;
    // Remove items collection
    itemsCollection.remove({});
});

// Show
showTmpl.helpers({
    company(){
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        return doc.company;
    },
    i18nLabel(label){
        let key = `cement.lendingStock.schema.${label}.label`;
        return TAPi18n.__(key);
    },
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
    'click .print-invoice-show'(event, instance){
        $('#to-print').printThis();
    }
});

// Hook
let hooksObject = {
    before: {
        insert: function (doc) {
            let items = [];
            let sumRemainQty = 0;
            itemsCollection.find().forEach((obj)=> {
                delete obj._id;
                obj.remainQty = obj.qty;
                sumRemainQty += obj.qty;
                items.push(obj);
            });
            doc.sumRemainQty = sumRemainQty;
            doc.items = items;
            doc.status = 'active';
            return doc;
        },
        update: function (doc) {
            let items = [];
            let sumRemainQty = 0;
            itemsCollection.find().forEach((obj)=> {
                delete obj._id;
                obj.remainQty = obj.qty;
                sumRemainQty += obj.qty;
                items.push(obj);
            });
            doc.$set.sumRemainQty = sumRemainQty;
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
                alertify.lendingStock().close();
            }
        } else {
            alertify.lendingStock().close();
        }
        // }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'PPOS_lendingStockNew',
    'PPOS_lendingStockEdit'
], hooksObject);
