import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
import {Template} from 'meteor/templating';
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';
import {AutoForm} from 'meteor/aldeed:autoform';
import {displaySuccess, displayError} from '../../../../core/client/libs/display-alert.js';
import {destroyAction} from '../../../../core/client/libs/destroy-action.js';

//import tabular
import  {TransferMoneyTabular} from '../../../common/tabulars/transferMoney';

import {TransferMoney} from '../../api/collections/transferMoney.js';
import {tmpCollection} from '../../api/collections/tmpCollection.js';
import './transferMoney.html';
let indexTmpl = Template.PPOS_transferMoney,
    insertTmpl = Template.PPOS_transferMoneyNew,
    actionTmpl = Template.PPOS_transferMoneyAction,
    editTmpl = Template.PPOS_transferMoneyEdit,
    showTmpl = Template.PPOS_transferMoneyShow;

// index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('transferMoney');
    createNewAlertify('transferMoneyShow', {size: 'lg'});
    // Reactive table filter
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.transferMoney(fa('plus', 'Add New'), renderTemplate(insertTmpl));
    }
});

indexTmpl.helpers({
    tabularTable(){
        return TransferMoneyTabular;
    },
    selector(){
        return {fromBranchId: Session.get('currentBranch')};
    }
});

//insert
insertTmpl.helpers({
    collection(){
        return TransferMoney;
    }
});

//update

editTmpl.helpers({
    collection(){
        return TransferMoney;
    },
    data(){
        return this;
    }
});
// actionTmpl
actionTmpl.events({
    'click .js-update'(event, instance){
        let data = this;
        alertify.transferMoney(fa('pencil', 'Edit Unit'), renderTemplate(editTmpl, data));
    },
    'click .js-display'(event, instance){
        alertify.transferMoneyShow(fa('pencil', 'Display'), renderTemplate(showTmpl, this));

    },
    'click .js-destroy'(event, instance) {
        destroyAction(
            TransferMoney,
            {_id: this._id},
            {title: 'Remove Unit', itemTitle: this._id}
        );
    }
});
//show tmpl
showTmpl.helpers({
    capitalize(name){
        return _.capitalize(name);
    },
    accepted(){
        if (!this.pending && this.status == 'closed') {
            return true;
        }
    },
    declined(){
        if (!this.pending && this.status == 'declined') {
            return true;
        }
    },
    company(){
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        return doc.company;
    },
});

let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.transferMoney().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};
AutoForm.addHooks([
    'PPOS_transferMoneyNew',
    'PPOS_transferMoneyEdit'
], hooksObject)
