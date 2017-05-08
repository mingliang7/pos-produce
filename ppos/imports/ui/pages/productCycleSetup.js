import './productCycleSetup.html';
import {ProductCycleSetup} from '../../api/collections/productCycleSetup';
import {createNewAlertify} from "../../../../core/client/libs/create-new-alertify";
import {renderTemplate} from "../../../../core/client/libs/render-template";
import {destroyAction} from "../../../../core/client/libs/destroy-action";
import {displayError, displaySuccess} from "../../../../core/client/libs/display-alert";
let indexTmpl = Template.PPOS_productCycleSetup;
let newTmpl = Template.PPOS_productCycleSetupNew;

indexTmpl.helpers({
    productCyclesSetup(){
        return ProductCycleSetup.find({});
    }
});

indexTmpl.onCreated(function () {
    createNewAlertify('productCycleSetup',);
});

indexTmpl.events({
    'click .js-create'(event, instance){
        alertify.productCycleSetup(fa('plus', 'New Cycle Setup'), renderTemplate(newTmpl));
    },
    'click .js-destroy' (event, instance) {
        let id = this._id;
        destroyAction(
            ProductCycleSetup,
            {_id: id},
            {title: 'Product Cycle Setup', itemTitle: id}
        );
    },
});

newTmpl.helpers({
    collection(){
        return ProductCycleSetup;
    }
});
// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.productCycleSetup().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks([
    'PPOS_productCycleSetupNew',
    'PPOS_productCycleSetupEdit'
], hooksObject);