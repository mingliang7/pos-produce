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
import {Penalty} from '../../api/collections/penalty.js';

// Tabular
import {PenaltyTabular} from '../../../common/tabulars/penalty.js';

// Page
import './penalty.html';

// Declare template
let indexTmpl = Template.PPOS_penalty,
    actionTmpl = Template.PPOS_penaltyAction,
    newTmpl = Template.PPOS_penaltyNew,
    editTmpl = Template.PPOS_penaltyEdit,
    showTmpl = Template.PPOS_penaltyShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('penalty');
    createNewAlertify('penaltyShow');

    // Reactive table filter

});

indexTmpl.helpers({
    tabularTable(){
        return PenaltyTabular;
    },
    selector() {
        return {};
    }

});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.penalty(fa('plus', TAPi18n.__('ppos.penalty.title')), renderTemplate(newTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.penalty(fa('pencil', TAPi18n.__('ppos.penalty.title')), renderTemplate(editTmpl, this));
    },
    'click .js-destroy' (event, instance) {
        var id = this._id;
        destroyAction(
            Penalty,
            {_id: id},
            {title: TAPi18n.__('ppos.penalty.title'), itemTitle: id});

    },
    'click .js-display' (event, instance) {
        alertify.penaltyShow(fa('eye', TAPi18n.__('ppos.penalty.title')), renderTemplate(showTmpl, this));
    }
});

newTmpl.onCreated(function () {
    this.penaltyList = new ReactiveVar();
    let penaltyId = Session.get('CategoryIdSession');
    Meteor.call('penaltyList', 'Select One | No Parent', penaltyId, (err, result) => {
        this.penaltyList.set(result);
    });
});
// New
newTmpl.helpers({
    collection(){
        return Penalty;
    }
});

newTmpl.onDestroyed(function () {
    Session.set('createPenalty', undefined);
});
// Edit


editTmpl.helpers({

    collection(){
        return Penalty;
    },
    data () {
        let data = this;
        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        this.subscribe('ppos.penalty', {_id: this.data._id});
    });
});

showTmpl.helpers({
    i18nLabel(label){
        let i18nLabel = `cement.penalty.schema.${label}.label`;
        return i18nLabel;
    },
    data () {
        let data = Penalty.findOne(this._id);
        return data;
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.penalty().close();
        }else{
            Session.set('createPenalty', true);
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'PPOS_penaltyNew',
    'PPOS_penaltyEdit'
], hooksObject);
