import {Meteor} from 'meteor/meteor';
import {ProductCycle} from '../../imports/api/collections/productCycle';
import {Item} from '../../imports/api/collections/item';

Meteor.methods({
    getOneProductCycle({_id}){
        let productCycle = ProductCycle.findOne({_id});
        productCycle.itemIn.forEach(function (item) {
            let itemObj = Item.findOne({_id: item.itemId});
            item.itemName = itemObj && itemObj.name || '';
        });
        productCycle.itemOut.forEach(function (item) {
            let itemObj = Item.findOne({_id: item.itemId});
            item.itemName = itemObj && itemObj.name || '';
        });
        return productCycle;
    }
});