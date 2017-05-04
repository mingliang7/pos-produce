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
import {Vendors} from '../../api/collections/vendor.js';
import {balanceTmpCollection} from '../../api/collections/tmpCollection';
// Tabular
import {VendorTabular} from '../../../common/tabulars/vendor.js';

// Page
import './vendor.html';

// Declare template
let indexTmpl = Template.PPOS_vendor,
    actionTmpl = Template.PPOS_vendorAction,
    newTmpl = Template.PPOS_vendorNew,
    newTmplDropDown = Template.PPOS_vendorNewDropDownForm,
    editTmpl = Template.PPOS_vendorEdit,
    showTmpl = Template.PPOS_vendorShow,
    buttonActiomTmpl = Template.PPOS_vendorButtonAction;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('vendor', {size: 'lg'});
    createNewAlertify('vendorShow',);

    // Reactive table filter
    this.filter = new ReactiveTable.Filter('ppos.vendorByBranchFilter', ['branchId']);
    this.autorun(()=> {
        this.filter.set(Session.get('currentBranch'));
    });
});

indexTmpl.onDestroyed(()=> {
    ReactiveTable.clearFilters(['ppos.vendorByBranchFilter']);
})

indexTmpl.helpers({
    tabularTable(){
        return VendorTabular;
    },
    selector() {
        return {};
    },
    tableSettings(){
        let i18nPrefix = 'ppos.vendor.schema';

        reactiveTableSettings.collection = 'ppos.reactiveTable.vendor';
        reactiveTableSettings.fields = [
            {
                key: '_id',
                label: __(`${i18nPrefix}._id.label`),
                sortOrder: 0,
                sortDirection: 'asc'
            },
            {key: 'name', label: __(`${i18nPrefix}.name.label`)},
            {key: 'gender', label: __(`${i18nPrefix}.gender.label`)},
            {key: 'telephone', label: __(`${i18nPrefix}.telephone.label`)},
            {key: '_term.name', label: __(`${i18nPrefix}.term.label`)},
            {key: '_paymentGroup.name', label: __(`${i18nPrefix}.paymentGroup.label`)},
            {
                key: '_id',
                label(){
                    return ''
                },
                headerClass: function () {
                    let css = 'col-receive-payment cursor-pointer';
                    return css;
                },
                tmpl: buttonActiomTmpl, sortable: false
            },
            {
                key: '_id',
                label(){
                    return fa('bars', '', true);
                },
                headerClass: function () {
                    let css = 'text-center col-action';
                    return css;
                },
                tmpl: actionTmpl, sortable: false
            }
        ];

        return reactiveTableSettings;
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.vendor(fa('plus', TAPi18n.__('ppos.vendor.title')), renderTemplate(newTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.vendor(fa('pencil', TAPi18n.__('ppos.vendor.title')), renderTemplate(editTmpl, this));
    },
    'click .js-destroy' (event, instance) {
        var id = this._id;
        Meteor.call('isVendorHasRelation', id, function (error, result) {
            if (error) {
                alertify.error(error.message);
            } else {
                if (result) {
                    alertify.warning("Data has been used. Can't remove.");
                } else {
                    destroyAction(
                        Vendors,
                        {_id: id},
                        {title: TAPi18n.__('ppos.vendor.title'), itemTitle: id}
                    );
                }
            }
        });

    },
    'click .js-display' (event, instance) {
        alertify.vendorShow(fa('eye', TAPi18n.__('ppos.vendor.title')), renderTemplate(showTmpl, this));
    },
    'click .go-to-pay-bill'(event, instance){
        FlowRouter.go('ppos.payBill', {vendorId: this._id});
    }
});

indexTmpl.onDestroyed(function () {
    balanceTmpCollection.remove({});
});
// New
newTmpl.onCreated(function () {
    this.paymentType = new ReactiveVar();
});

newTmpl.helpers({
    collection(){
        return Vendors;
    },
    isTerm(){
        return Template.instance().paymentType.get() == "Term";
    },
    isGroup(){
        return Template.instance().paymentType.get() == "Group";
    }
});
newTmpl.events({
    'change [name="paymentType"]'(event, instance){
        instance.paymentType.set($(event.currentTarget).val());
    }
});
newTmplDropDown.onCreated(function () {
    this.paymentType = new ReactiveVar();
});

newTmplDropDown.helpers({
    collection(){
        return Vendors;
    },
    isTerm(){
        return Template.instance().paymentType.get() == "Term";
    },
    isGroup(){
        return Template.instance().paymentType.get() == "Group";
    }
});
newTmplDropDown.events({
    'change [name="paymentType"]'(event, instance){
        instance.paymentType.set($(event.currentTarget).val());
    }
});

// Edit
editTmpl.onCreated(function () {
    this.paymentType = new ReactiveVar(this.data.paymentType);
    this.autorun(()=> {
        this.subscribe('ppos.vendor', {_id: this.data._id});
    });
});
editTmpl.events({
    'change [name="paymentType"]'(event, instance){
        instance.paymentType.set($(event.currentTarget).val());
    }
});

editTmpl.helpers({
    collection(){
        return Vendors;
    },
    data () {
        let data = Vendors.findOne(this._id);
        return data;
    },
    isTerm(){
        return Template.instance().paymentType.get() == "Term";
    },
    isGroup(){
        return Template.instance().paymentType.get() == "Group";
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        this.subscribe('ppos.vendor', {_id: this.data._id});
    });
});

showTmpl.helpers({
    i18nLabel(label){
        let i18nLabel = `cement.vendor.schema.${label}.label`;
        return i18nLabel;
    },
    data () {
        let data = Vendors.findOne(this._id);
        return data;
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.vendor().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'PPOS_vendorNew',
    'PPOS_vendorEdit'
], hooksObject);
