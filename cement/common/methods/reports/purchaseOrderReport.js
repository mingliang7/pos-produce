import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {PurchaseOrder} from '../../../imports/api/collections/purchaseOrder';
// lib func
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
export const purchaseOrderReport = new ValidatedMethod({
    name: 'cement.purchaseOrderReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            let selector = {};
            let project = {};
            let data = {
                title: {},
                fields: [],
                displayFields: [],
                content: [{index: 'No Result'}],
                footer: {}
            };
            let branch = [];
            let user = Meteor.users.findOne(Meteor.userId());
            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            selector.status = {$in: ['active', 'closed']};
            if(params.type == 'activeAndPartial' || !params.type){
                selector.sumRemainQty = {$gt: 0};
            }
            if (params.date) {
                let asDate = moment(params.date).toDate();
                data.title.date = moment(asDate).format('YYYY-MMM-DD hh:mm a');
                selector.purchaseOrderDate = {$lte: asDate};
            }
            if (params.customer && params.customer != '') {
                selector.customerId = params.customer;
            }
            if(params.vendor && params.vendor != ''){
                selector.vendorId = params.vendor;
            }
            if (params.filter && params.filter != '') {
                let filters = params.filter.split(','); //map specific field
                for (let i = 0; i < filters.length; i++) {
                    data.fields.push({field: correctFieldLabel(filters[i])});
                    data.displayFields.push({field: filters[i]});
                    project[filters[i]] = `$${filters[i]}`;
                    if (filters[i] == 'customerId') {
                        project['_customer'] = '$_customer'
                    }
                }
                data.fields.push({field: 'Total'}); //map total field for default
                data.displayFields.push({field: 'total'});
                project['total'] = '$total'; //get total projection for default
            } else {
                project = {
                    '_id': '$_id',
                    'purchaseOrderDate': '$purchaseOrderDate',
                    'customer': '$_customer.name',
                    'vendor': '$_vendor.name',
                    'status': '$status',
                    'sumRemainQty': '$sumRemainQty',
                    'total': '$total'
                };
                data.fields = [{field: '#ID'}, {field: 'Date'}, {field: 'Customer'}, {field: 'Status'}, {field: 'Remain Qty'}, {field: 'Total'}];
                data.displayFields = [{field: '_id'}, {field: 'purchaseOrderDate'}, {field: 'customer'}, {field: 'status'}, {field: 'sumRemainQty'}, {field: 'total'}];
            }

            /****** Title *****/
            data.title.company = Company.findOne();

            /****** Content *****/
            let purchaseOrders = PurchaseOrder.aggregate([
                {
                    $match: selector
                }, {
                    $unwind: {path: '$items', preserveNullAndEmptyArrays: true},

                }, {
                    $lookup: {
                        from: "cement_item",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {$unwind: {path: '$itemDoc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: '$_id',
                        data: {
                            $last: project
                        },
                        items: {
                            $push: {
                                qty: '$items.qty',
                                price: '$items.price',
                                amount: '$items.amount',
                                itemId: '$items.itemId',
                                stockReceived: {$subtract: ["$items.qty", "$items.remainQty"]},
                                itemName: '$itemDoc.name',
                                remainQty: '$items.remainQty'
                            }
                        },
                        total: {$last: '$total'},
                        totalOrder: {$sum: '$items.qty'},
                        sumRemainQty: {$last: '$sumRemainQty'}
                    }
                },
                {$sort: {'data.purchaseOrderDate': 1}},
                {
                    $group: {
                        _id: null,
                        data: {$push: '$$ROOT'},
                        total: {$sum: '$total'},
                        totalOrder: {$sum: '$totalOrder'},
                        totalRemainQty: {$sum: '$sumRemainQty'},
                        totalOrderReceive: {$sum: {$subtract: ["$totalOrder", "$sumRemainQty"]}}
                    }
                }
            ]);

            if (purchaseOrders.length > 0) {
                data.content = purchaseOrders[0].data;
                data.footer.total = purchaseOrders[0].total;
                data.footer.totalOrder = purchaseOrders[0].totalOrder;
                data.footer.totalRemainQty = purchaseOrders[0].totalRemainQty;
                data.footer.totalOrderReceive = purchaseOrders[0].totalOrderReceive
            }
            return data
        }
    }
});
