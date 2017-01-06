import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';
import {moment} from 'meteor/momentjs:moment';

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
import {AdvanceDiscount} from '../../api/collections/advanceDiscount.js';

// Tabular
import {AdvanceDiscountTabular} from '../../../common/tabulars/advanceDiscount.js';

// Page
import './advanceDiscount.html';

// Declare template
let indexTmpl = Template.Cement_advanceDiscount,
    actionTmpl = Template.Cement_advanceDiscountAction,
    newTmpl = Template.Cement_advanceDiscountNew,
    editTmpl = Template.Cement_advanceDiscountEdit,
    showTmpl = Template.Cement_advanceDiscountShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('advanceDiscount');
    createNewAlertify('advanceDiscountShow');
});


indexTmpl.helpers({
    tabularTable(){
        return AdvanceDiscountTabular;
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.advanceDiscount(fa('plus', TAPi18n.__('cement.advanceDiscount.title')), renderTemplate(newTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.advanceDiscount(fa('pencil', TAPi18n.__('cement.advanceDiscount.title')), renderTemplate(editTmpl, this));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            AdvanceDiscount,
            {_id: this._id},
            {title: TAPi18n.__('cement.advanceDiscount.title'), itemTitle: this._id}
        );
    },
});

// New
newTmpl.helpers({
    collection(){
        return AdvanceDiscount;
    }
});

// Edit
editTmpl.onCreated(function () {

});

editTmpl.helpers({
    collection(){
        return AdvanceDiscount;
    },
    data () {
        return this;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        this.subscribe('cement.rep', {_id: this.data._id});
    });
});

showTmpl.helpers({
    i18nLabel(label){
        let i18nLabel = `cement.rep.schema.${label}.label`;
        return i18nLabel;
    },
    data () {
        let data = AdvanceDiscount.findOne(this._id);
        return data;
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.advanceDiscount().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'Cement_advanceDiscountNew',
    'Cement_advanceDiscountEdit'
], hooksObject);
