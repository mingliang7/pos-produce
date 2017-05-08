import './productCycle.html';
import {
    ProductCycleSetup,
    productCycleItemInSchema,
    productCycleItemOutSchema
} from '../../api/collections/productCycleSetup';
import {ProductCycle} from '../../api/collections/productCycle';
import {ProductCycleTabular} from '../../../common/tabulars/productCycle';
import {createNewAlertify} from "../../../../core/client/libs/create-new-alertify";
import {renderTemplate} from "../../../../core/client/libs/render-template";
import {displayError, displaySuccess} from "../../../../core/client/libs/display-alert";
let indexTmpl = Template.PPOS_productCycle;
let newTmpl = Template.PPOS_productCycleNew;
let editTmpl = Template.PPOS_productCycleEdit;
let tmpItemIn = Template.PPOS_tmpItemIn;
let tmpItemOut = Template.PPOS_tmpItemOut;
let tmpItemInCollection = new Mongo.Collection(null),
    tmpItemOutCollection = new Mongo.Collection(null);
indexTmpl.onCreated(function () {
    this.selector = new ReactiveVar([]);
    createNewAlertify('productCycle', {size: 'lg'});
});

indexTmpl.helpers({
    selector(){
        let instance = Template.instance();
        let selector = instance.selector.get();
        if (selector.length <= 0) {
            return {}
        }
        return {cycleType: {$in: selector}}
    },
    tabularTable(){
        return ProductCycleTabular;
    },
    productCycleSetup(){
        return ProductCycleSetup.find({});
    }
});

indexTmpl.events({
    'change .cycle-setup'(event, instance){
        let selector = instance.selector.get();
        let currentTarget = $(event.currentTarget);
        if (currentTarget.prop('checked')) {
            selector.push(currentTarget.val())
        } else {
            selector = _.filter(selector, function (o) {
                return o != currentTarget.val()
            })
        }
        instance.selector.set(selector);
    },
    'click .js-create'(event, instance){
        alertify.productCycle(fa('plus', 'Add Product Cycle'), renderTemplate(newTmpl));
    },
    'click .js-update'(event, instance){
        alertify.productCycle(fa('plus', 'Add Product Cycle'), renderTemplate(editTmpl, this._id));
    }
});

newTmpl.helpers({
    collection(){
        return ProductCycle;
    }
});

newTmpl.onDestroyed(function(){
    tmpItemInCollection.remove({});
    tmpItemOutCollection.remove({})
});

editTmpl.onCreated(function () {
    this.doc = new ReactiveVar([]);
    Meteor.call('getOneProductCycle', {_id: this.data}, (err, result) => {
        if (!err) {
            this.doc.set(result);
            result.itemIn.forEach(function (item) {
                tmpItemInCollection.insert(item);
            });
            result.itemOut.forEach(function (item) {
                tmpItemOutCollection.insert(item);
            });
        }
    });
});

editTmpl.onDestroyed(function () {
    tmpItemInCollection.remove({});
    tmpItemOutCollection.remove({})
});

editTmpl.helpers({
    doc(){
        let instance = Template.instance();
        return instance.doc.get();
    },
    collection(){
        return ProductCycle;
    }
});

tmpItemIn.helpers({
    schema(){
        return productCycleItemInSchema;
    },
    tmpInCollection(){
        return tmpItemInCollection.find({});
    }
});

tmpItemIn.events({
    'change [name="itemId"]': function (event, instance) {
        instance.name = event.currentTarget.selectedOptions[0].text;
        instance.itemId = event.currentTarget.value;
    },
    'change [name="qty"]': function (event, instance) {
        let currentTarget = $(event.currentTarget);
        if (currentTarget == '') {
            $(event.currentTarget).val(0)
        } else {
            instance.qty = parseFloat(currentTarget.val());
        }
    },
    'click .js-add-item'(event, instance){
        let selector = {
            itemName: instance.name,
            qty: instance.qty,
            itemId: instance.itemId
        };
        if (selector.itemId) {
            tmpItemInCollection.insert(selector)
        } else {
            alertify.warning('Please select item!');
        }
    },
    'click .remove-itemIn'(event, instance){
        let _id = $(event.currentTarget).attr('data-itemId');
        tmpItemInCollection.remove({_id});
    }
});

tmpItemOut.helpers({
    schema(){
        return productCycleItemInSchema;
    },
    tmpOutCollection(){
        return tmpItemOutCollection.find({});
    }
});
tmpItemOut.events({
    'change [name="itemId"]': function (event, instance) {
        instance.name = event.currentTarget.selectedOptions[0].text;
        instance.itemId = event.currentTarget.value;
    },
    'change [name="qty"]': function (event, instance) {
        let currentTarget = $(event.currentTarget);
        if (currentTarget == '') {
            $(event.currentTarget).val(0)
        } else {
            instance.qty = parseFloat(currentTarget.val());
        }
    },
    'click .js-add-item'(event, instance){
        let selector = {
            itemName: instance.name,
            qty: instance.qty,
            itemId: instance.itemId
        };
        if (selector.itemId) {
            tmpItemOutCollection.insert(selector)
        } else {
            alertify.warning('Please select item!');
        }
    },
    'click .remove-itemOut'(event, instance){
        let _id = $(event.currentTarget).attr('data-itemId');
        tmpItemOutCollection.remove({_id});
    }
});

AutoForm.hooks({
    PPOS_productCycleNew: {
        before: {
            insert(doc){
                let itemIn = tmpItemInCollection.find({}).fetch();
                let itemOut = tmpItemOutCollection.find({}).fetch();
                doc.itemIn = itemIn;
                doc.itemOut = itemOut;
                doc.branchId = Session.get('currentBranch');
                return doc;
            }
        },
        onSuccess(formType, result){
            displaySuccess();
            tmpItemInCollection.remove({});
            tmpItemOutCollection.remove({})
        },
        onError(formType, err){
            displayError(err, message);
        }
    },
    PPOS_productCycleUp: {
        before: {
            update(doc){
                let itemIn = tmpItemInCollection.find({}).fetch();
                let itemOut = tmpItemOutCollection.find({}).fetch();
                doc.itemIn = itemIn;
                doc.itemOut = itemOut;
                delete doc.$unset;
                return doc;
            }
        },
        onSuccess(formType, result){
            displaySuccess();
            tmpItemInCollection.remove({});
            tmpItemOutCollection.remove({})
        },
        onError(formType, err){
            displayError(err, message);
        }
    }
});