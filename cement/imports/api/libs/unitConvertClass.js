export default class UnitConvertClass {
    static convertQtyFromUnitConvert({qty, unitConvert}) {
        let currentConvertQty = 0;
        if (unitConvert.coefficient == 'addition') {
            currentConvertQty = qty + unitConvert.convertAmount;
        } else if (unitConvert.coefficient == 'subtract') {
            currentConvertQty = qty - unitConvert.convertAmount;
        } else if (unitConvert.coefficient == 'divide') {
            currentConvertQty = qty / unitConvert.convertAmount;
        } else {
            currentConvertQty = qty * unitConvert.convertAmount;
        }
        return currentConvertQty;
    }

    static addParamsDes({qty, unitConvert}) {
        // let currentConvertQty = 0;
        // let des = FlowRouter.query.get('des') || '';
        // if (unitConvert.coefficient == 'addition') {
        //     currentConvertQty = qty + unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty} គិតជា${unitConvert._unit.name} បូក ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        //
        // } else if (unitConvert.coefficient == 'subtract') {
        //     currentConvertQty = qty - unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty} គិតជា${unitConvert._unit.name} ដក ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        //
        // } else if (unitConvert.coefficient == 'divide') {
        //     currentConvertQty = qty / unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty} គិតជា${unitConvert._unit.name} ៖ ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        //
        // } else {
        //     currentConvertQty = qty * unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty} គិតជា${unitConvert._unit.name} x ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        //
        // }
        // return des;
    }

    static reverseCoefficient({qty, unitConvert}) {
        // let currentConvertQty = 0;
        // let des = FlowRouter.query.get('des') || '';
        // if (unitConvert.coefficient == 'addition') {
        //     currentConvertQty = (qty - unitConvert.convertAmount) + unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty - unitConvert.convertAmount} គិតជា${unitConvert._unit.name} បូក ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        // } else if (unitConvert.coefficient == 'subtract') {
        //     currentConvertQty = (qty + unitConvert.convertAmount) - unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty + unitConvert.convertAmount} គិតជា${unitConvert._unit.name} ដក ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        // } else if (unitConvert.coefficient == 'divide') {
        //     currentConvertQty = (qty * unitConvert.convertAmount) / unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty * unitConvert.convertAmount} គិតជា${unitConvert._unit.name} ៖ ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        // } else {
        //     currentConvertQty = (qty / unitConvert.convertAmount) * unitConvert.convertAmount;
        //     des += `<b>${unitConvert._item.name}</b> x${qty / unitConvert.convertAmount} គិតជា${unitConvert._unit.name} x ចំនួន Convert ${unitConvert.convertAmount}=${currentConvertQty}${unitConvert._item._unit.name},<br>`;
        // }
        // return des;
    }


    static removeConvertItem(item, instance,itemsCollection){
        // FlowRouter.query.set({des: ''}); //reset description field to empty
        // if (item == 1) {
        //     let currentUnitConvertArr = instance.unitConvert.get();
        //     let tmpData = itemsCollection.find({});
        //     if (tmpData.count() > 0) {
        //         tmpData.forEach(function (doc) {
        //             Meteor.call("getUnitConvert", doc.unitConvertId, function (err, result) {
        //                 if (result) {
        //                     let desState = FlowRouter.query.get('des') || '';
        //                     desState += UnitConvertClass.reverseCoefficient({qty: doc.qty, unitConvert: result});
        //                     desState += '<br>';
        //                     FlowRouter.query.set({des: desState});
        //                 }
        //             });
        //         });
        //     }
        // }
    }
}