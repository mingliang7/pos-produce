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
import {ReceivePayment} from '../../api/collections/receivePayment.js';

// Tabular
import {TsPaymentListTabular} from '../../../common/tabulars/tsPaymentList.js';

// Page
import './tsPaymentList.html';
import {tmpCollection} from '../../api/collections/tmpCollection';
// Declare template
let indexTmpl = Template.PPOS_tsPaymentList;



indexTmpl.helpers({
    tabularTable(){
        return TsPaymentListTabular;
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
            Meteor.call('removedTSPayment', {doc});
            swal("Deleted!", `វិក័យប័ត្របង់ប្រាក់លេខ ${doc._id} បានលុបដោយជោគជ័យ`, "success");
        });
    },
    'click .js-display' (event, instance) {
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
    'PPOS_paymentTransactionListNew',
    'PPOS_paymentTransactionListEdit'
], hooksObject);
