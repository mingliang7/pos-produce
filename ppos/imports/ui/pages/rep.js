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
import {Reps} from '../../api/collections/rep.js';
import {RepsSchema} from '../../api/collections/rep.js';

// Tabular
import {RepTabular} from '../../../common/tabulars/rep.js';

// Page
import './rep.html';

// Declare template
let indexTmpl = Template.PPOS_rep,
    actionTmpl = Template.PPOS_repAction,
    newTmpl = Template.PPOS_repNew,
    editTmpl = Template.PPOS_repEdit,
    showTmpl = Template.PPOS_repShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('rep', {size: 'lg'});
    createNewAlertify('repShow',);

    // Reactive table filter
    this.filter = new ReactiveTable.Filter('ppos.repByBranchFilter', ['branchId']);
    this.autorun(() => {
        this.filter.set(Session.get('currentBranch'));
    });
});


indexTmpl.helpers({
    tabularTable(){
        return RepTabular;
    },
    selector() {
        return {branchId: Session.get('currentBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.rep(fa('plus', TAPi18n.__('ppos.rep.title')), renderTemplate(newTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.rep(fa('pencil', TAPi18n.__('ppos.rep.title')), renderTemplate(editTmpl, this));
    },
    'click .js-destroy' (event, instance) {
        var id = this._id;
        Meteor.call('isRepHasRelation', id, function (error, result) {
            if (error) {
                alertify.error(error.message);
            } else {
                if (result) {
                    alertify.warning("Data has been used. Can't remove.");
                } else {
                    destroyAction(
                        Reps,
                        {_id: id},
                        {title: TAPi18n.__('ppos.rep.title'), itemTitle: id}
                    );
                }
            }
        });

    },
    'click .js-display' (event, instance) {
        alertify.repShow(fa('eye', TAPi18n.__('ppos.rep.title')), renderTemplate(showTmpl, this));
    }
});

// New
newTmpl.helpers({
    collection(){
        return Reps;
    }
});

// Edit
editTmpl.onCreated(function () {
    this.autorun(() => {
        this.subscribe('ppos.rep', {_id: this.data._id});
    });
});

editTmpl.helpers({
    schema(){
        return RepsSchema;
    },
    data () {
        let data = Reps.findOne(this._id);
        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(() => {
        this.subscribe('ppos.rep', {_id: this.data._id});
    });
});

showTmpl.helpers({
    i18nLabel(label){
        let i18nLabel = `cement.rep.schema.${label}.label`;
        return i18nLabel;
    },
    data () {
        let data = Reps.findOne(this._id);
        return data;
    }
});

// Hook

AutoForm.hooks({
    PPOS_repNew: {
        onSuccess(formType, result){
            displaySuccess();
        },
        onError (formType, error) {
            displayError(error.message);
        }
    },
    PPOS_repEdit: {
        onSubmit: function (insertDoc, updateDoc, doc) {
            let repId = $('#rep-id').val();
            Meteor.call('updateRep', repId, updateDoc, (err, result) => {
                displaySuccess();
                alertify.rep().close();
            });
            return false;
        },
        onSuccess (formType, result) {
            if (formType == 'update') {
                alertify.rep().close();
            }
            displaySuccess();

        },
        onError (formType, error) {
            displayError(error.message);
        }
    }
});
