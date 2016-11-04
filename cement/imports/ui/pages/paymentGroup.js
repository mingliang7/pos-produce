import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';


// Lib
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../../core/client/libs/display-alert.js';
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../../core/client/components/loading.js';
import '../../../../core/client/components/column-action.js';
import '../../../../core/client/components/form-footer.js';

// Collection
import {PaymentGroups} from '../../api/collections/paymentGroup.js';

// Tabular
import {PaymentGroupTabular} from '../../../common/tabulars/paymentGroup.js';

// Page
import './paymentGroup.html';

// Declare template
let indexTmpl = Template.Cement_paymentGroup,
    actionTmpl = Template.Cement_paymentGroupAction,
    newTmpl = Template.Cement_paymentGroupNew,
    editTmpl = Template.Cement_paymentGroupEdit,
    showTmpl = Template.Cement_paymentGroupShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('paymentGroup', {size: 'lg'});
    createNewAlertify('paymentGroupShow');

    // Reactive table filter
    this.filter = new ReactiveTable.Filter('cement.paymentGroupByBranchFilter', ['branchId']);
    this.autorun(()=> {
        this.filter.set(Session.get('currentBranch'));
    });
});

indexTmpl.helpers({
    tabularTable(){
        return PaymentGroupTabular;
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.paymentGroup(fa('plus', TAPi18n.__('cement.paymentGroup.title')), renderTemplate(newTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.paymentGroup(fa('pencil', TAPi18n.__('cement.paymentGroup.title')), renderTemplate(editTmpl, this));
    },
    'click .js-destroy' (event, instance) {
        var id = this._id;
        Meteor.call('isPaymentGroupHasRelation',id, function (error, result) {
            if (error) {
                alertify.error(error.message);
            } else {
                if (result) {
                    alertify.warning("Data has been used. Can't remove.");
                } else {
                    destroyAction(
                        PaymentGroups,
                        {_id: id},
                        {title: TAPi18n.__('cement.paymentGroup.title'), itemTitle: id}
                    );
                }
            }
        });


    },
    'click .js-display' (event, instance) {
        alertify.paymentGroupShow(fa('eye', TAPi18n.__('cement.paymentGroup.title')), renderTemplate(showTmpl, this));
    }
});

// New
newTmpl.helpers({
    collection(){
        return PaymentGroups;
    }
});

// Edit
editTmpl.onCreated(function () {
    this.autorun(()=> {
        this.subscribe('cement.paymentGroup', {_id: this.data._id});
    });
});

editTmpl.helpers({
    collection(){
        return PaymentGroups;
    },
    data () {
        let data = PaymentGroups.findOne(this._id);
        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        this.subscribe('cement.paymentGroup', {_id: this.data._id});
    });
});

showTmpl.helpers({
    i18nLabel(label){
        let i18nLabel = `cement.paymentGroup.schema.${label}.label`;
        return i18nLabel;
    },
    data () {
        let data = PaymentGroups.findOne(this._id);
        return data;
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.paymentGroup().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'Cement_paymentGroupNew',
    'Cement_paymentGroupEdit'
], hooksObject);
