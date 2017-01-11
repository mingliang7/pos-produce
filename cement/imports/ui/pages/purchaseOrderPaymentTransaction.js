import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';
import {ReactiveMethod} from 'meteor/simple:reactive-method';

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
import {PurchaseOrderPayment} from '../../api/collections/purchaseOrderPayment.js';

// Tabular
import {PurchaseOrderPaymentTransaction} from '../../../common/tabulars/purchaseOrderPayment.js';

// Page
import './purchaseOrderPaymentTransaction.html';
import {tmpCollection} from '../../api/collections/tmpCollection';
// Declare template
let indexTmpl = Template.Cement_purchaseOrderPaymentTransaction,
    actionTmpl = Template.Cement_purchaseOrderPaymentTransactionAction,
    editTmpl = Template.Cement_purchaseOrderPaymentTransactionEdit,
    showTmpl = Template.Cement_purchaseOrderShowInPoPayment;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('purchaseOrderPaymentTransaction', {size: 'lg'});
    createNewAlertify('purchaseOrderPaymentTransactionShow', {size: 'lg'});
    // Reactive table filter

});

indexTmpl.helpers({
    tabularTable(){
        return PurchaseOrderPaymentTransaction;
    },
    selector() {
        return {branchId: Session.get('currentBranch'), status: {$in: ['closed', 'partial']}};
    }

});

indexTmpl.onDestroyed(function () {
    tmpCollection.remove({});
});

indexTmpl.events({
    'click .js-update' (event, instance) {
        // alertify.penalty(fa('pencil', TAPi18n.__('cement.penalty.title')), renderTemplate(editTmpl, this));
    },
    'click .js-destroy' (event, instance) {
        let doc = this;
        swal({
            title: "Are you sure?",
            text: `ធ្វើការលុបវិក័យប័ត្របង់ប្រាក់លេខ  ${this._id}`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }).then(function () {
            Meteor.call('removedPoPayment', {doc});
            swal("Deleted!", `វិក័យប័ត្របង់ប្រាក់លេខ ${doc._id} បានលុបដោយជោគជ័យ`, "success");
        });
    },
    'dblclick tbody > tr' (event, instance) {
        let dataTalbe = $(event.currentTarget).closest('table').DataTable();
        let rowData = dataTalbe.row(event.currentTarget).data();
        swal({
            title: "Pleas Wait",
            text: "Getting Invoices....", showConfirmButton: false
        });
        Meteor.call('getPurchaseOrderDetail', {_id: rowData.billId},function (err,result) {
            swal.close();
            result.customer = _.capitalize(result._customer.name);
            result.vendor = _.capitalize(result._vendor.name);
            alertify.purchaseOrderPaymentTransactionShow(fa('eye', 'Purchase Order'), renderTemplate(showTmpl, result)).maximize();

        })
    }
});

// Edit


editTmpl.helpers({

    collection(){
        return PurchaseOrderPayment;
    },
    data () {
        let data = this;
        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(() => {
        this.subscribe('cement.penalty', {_id: this.data._id});
    });
});

showTmpl.helpers({
    company(){
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        return doc.company;
    },
    i18nLabel(label) {
        let key = `cement.invoice.schema.${label}.label`;
        return TAPi18n.__(key);
    },
    colorizeType(type) {
        if (type == 'term') {
            return `<label class="label label-info">T</label>`
        }
        return `<label class="label label-success">G</label>`
    },
    colorizeStatus(status) {
        if (status == 'active') {
            return `<label class="label label-info">A</label>`
        } else if (status == 'partial') {
            return `<label class="label label-danger">P</label>`
        }
        return `<label class="label label-success">C</label>`
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.penalty().close();
        } else {
            Session.set('createPenalty', true);
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'Cement_purchaseOrderPaymentTransactionNew',
    'Cement_purchaseOrderPaymentTransactionEdit'
], hooksObject);
