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
import {StockParents} from '../../api/collections/stockParents.js';

// Tabular
import {StockParentsTabular} from '../../../common/tabulars/stockParents.js';

// Page
import './stockParents.html';

// Declare template
let indexTmpl = Template.PPOS_stockParents,
    actionTmpl = Template.PPOS_stockParentsAction,
    newTmpl = Template.PPOS_stockParentsNew,
    editTmpl = Template.PPOS_stockParentsEdit,
    showTmpl = Template.PPOS_stockParentsShow;

let tmpParents = new Mongo.Collection(null);
// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('stockParents', {size: 'lg'});
    createNewAlertify('stockParentsShow',);

});

indexTmpl.onDestroyed(() => {
    ReactiveTable.clearFilters(['ppos.stockParentsByBranchFilter']);
})

indexTmpl.helpers({
    tabularTable(){
        return StockParentsTabular;
    },
    selector() {
        return {branchId: Session.get('currentBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.stockParents(fa('plus', TAPi18n.__('ppos.stockParents.title')), renderTemplate(newTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.stockParents(fa('pencil', TAPi18n.__('ppos.stockParents.title')), renderTemplate(editTmpl, this));
    },
    'click .js-destroy' (event, instance) {
        var id = this._id;
        // Meteor.call('isStockLocationHasRelation', id, function (error, result) {
        //     if (error) {
        //         alertify.error(error.message);
        //     } else {
        //         if (result) {
        //             alertify.warning("Data has been used. Can't remove.");
        //         } else {
                    destroyAction(
                        StockParents,
                        {_id: id},
                        {title: TAPi18n.__('ppos.stockParents.title'), itemTitle: id}
                    );
        //         }
        //     }
        // });

    },
    'click .js-display' (event, instance) {
        alertify.stockParentsShow(fa('eye', TAPi18n.__('ppos.stockParents.title')), renderTemplate(showTmpl, this));
    }
});

// New
newTmpl.onCreated(function () {
    this.parentsSelectOptions = new ReactiveVar([]);
    Meteor.call('fetchStockParentsAsSelectOptions', (err, result) => {
        if (!err) {
            this.parentsSelectOptions.set(result);
        }
    });
});
newTmpl.onRendered(function () {
    this.autorun(() => {
        if (FlowRouter.getQueryParam('_id')) {
            Meteor.call('fetchStockParentsAsSelectOptions', (err, result) => {
                if (!err) {
                    this.parentsSelectOptions.set(result || []);
                }
            });
        }
    });
});
newTmpl.helpers({
    parentsOption(){
        let instance = Template.instance();
        let parents = instance.parentsSelectOptions.get();
        parents.forEach(function (list) {
            list.label = Spacebars.SafeString(list.label);
        });
        return parents;
    },
    collection(){
        return StockParents;
    }
});
newTmpl.events({
    'change [name="parents"]'(event, instance){
        tmpParents.remove({});
        let currentOption = $('option:selected', event.currentTarget).attr('data-parents');
        tmpParents.insert({parentId: event.currentTarget.value, parents: currentOption.split(',')});
    }
});
newTmpl.onDestroyed(function () {
    FlowRouter.setQueryParams({_id: null});
    tmpParents.remove({});
});
// Edit
editTmpl.onCreated(function () {
    this.autorun(() => {
        this.subscribe('ppos.stockParents', {_id: this.data._id});
    });
});

editTmpl.helpers({
    collection(){
        return StockLocations;
    },
    data () {
        let data = StockLocations.findOne(this._id);
        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(() => {
        this.subscribe('ppos.stockParents', {_id: this.data._id});
    });
});

showTmpl.helpers({
    i18nLabel(label){
        let i18nLabel = `cement.stockParents.schema.${label}.label`;
        return i18nLabel;
    },
    data () {
        let data = StockParents.findOne(this._id);
        return data;
    }
});
AutoForm.hooks({
    PPOS_stockParentsNew: {
        before: {
            insert(doc){
                let tmp = tmpParents.findOne({});
                let parents = tmp && tmp.parents || [];
                if (parents.length > 0) {
                    parents.push(tmp.parentId);
                }
                doc.branchId = Session.get('currentBranch');
                doc.parents = parents;
                return doc;
            }
        },
        onSuccess(formType, result){
            tmpParents.remove({});
            FlowRouter.setQueryParams({_id: result});
            displaySuccess();
        },
        onError(formType, err){
            displayError(err.message);
        }
    },
    PPOS_stockParentsEdit: {
        onSuccess (formType, result) {
            tmpParents.remove({});
            alertify.stockParents().close();
            displaySuccess();
        },
        onError (formType, error) {
            displayError(error.message);
        }
    }
});
