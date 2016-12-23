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
import  {UnitConvertTabular} from '../../../common/tabulars/unitConvert';

import {UnitConvert} from '../../api/collections/unitConvert.js';
import {tmpCollection} from '../../api/collections/tmpCollection.js';
import './unitConvert.html';
let indexTmpl = Template.Cement_unitConvert,
    insertTmpl = Template.Cement_unitConvertNew,
    actionTmpl = Template.Cement_unitConvertAction,
    editTmpl = Template.Cement_unitConvertEdit,
    showTmpl = Template.Cement_unitConvertShow;

// index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('unitConvert');
    // Reactive table filter
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.unitConvert(fa('plus', 'Add New'), renderTemplate(insertTmpl));
    }
});

indexTmpl.helpers({
    tabularTable(){
        return UnitConvertTabular;
    }
});

//insert
insertTmpl.helpers({
    collection(){
        return UnitConvert;
    }
});

//update

editTmpl.helpers({
    collection(){
        return UnitConvert;
    },
    data(){
        return this;
    }
});
// actionTmpl
actionTmpl.events({
    'click .js-update'(event, instance){
        let data = this;
        alertify.unitConvert(fa('pencil', 'Edit Unit'), renderTemplate(editTmpl, data));
    },
    'click .js-display'(event, instance){
        alertify.unitConvert(fa('pencil', 'Display'), renderTemplate(showTmpl, this));

    },
    'click .js-destroy'(event, instance) {
        destroyAction(
            UnitConvert,
            {_id: this._id},
            {title: 'Remove Unit', itemTitle: this._id}
        );
    }
});

let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.unitConvert().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};
AutoForm.addHooks([
    'Cement_unitConvertNew',
    'Cement_unitConvertEdit'
], hooksObject)
