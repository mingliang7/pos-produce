//component
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//page
import './saleOrderSummary.html';
//import DI
import  'printthis';
//import collection
import {saleOrderSummarySchema} from '../../api/collections/reports/saleOrderSummary';
//methods
import {saleOrderSummary} from '../../../common/methods/reports/saleOrderSummary';
//state
let paramsState = new ReactiveVar();
let invoiceData = new ReactiveVar();
//declare template
let indexTmpl = Template.Cement_saleOrderSummary,
    invoiceDataTmpl = Template.saleOrderSummaryData;
Tracker.autorun(function () {
    if (paramsState.get()) {
        swal({
            title: "Pleas Wait",
            text: "Fetching Data....", showConfirmButton: false
        });
        saleOrderSummary.callPromise(paramsState.get())
            .then(function (result) {
                invoiceData.set(result);
                setTimeout(function () {
                    swal.close()
                }, 200);
            }).catch(function (err) {
            swal.close();
        })
    }
});

indexTmpl.onCreated(function () {
    createNewAlertify('saleOrderSummary');
    paramsState.set(FlowRouter.query.params());
});
indexTmpl.helpers({
    schema(){
        return saleOrderSummarySchema;
    }
});
indexTmpl.events({
    'click .print-invoice'(event, instance){
        window.print();
    },
    'click .printReport'(event,instance){
        window.print();
    }
});
invoiceDataTmpl.helpers({
    company(){
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        return doc.company;
    },
    data(){
        if (invoiceData.get()) {
            return invoiceData.get();
        }
    },

    display(col){
        let data = '';
        this.displayFields.forEach(function (obj) {
            if (obj.field == 'orderDate') {
                data += `<td>${moment(col[obj.field]).format('DD/MM/YYYYY')}</td>`
            } else if (obj.field == 'customerId') {
                data += `<td>${col._customer.name}</td>`
            } else if (obj.field == 'total') {
                data += `<td class="text-right">${numeral(col[obj.field]).format('0,0.00')}</td>`
            } else if (obj.field == 'journalDoc'){
                let arr = [];
                col[obj.field].map(function(e){ arr.push(e._id)})
                if(arr.length > 1){
                    data += `<td class="text-right" style="background: yellow;">${arr.length > 0 ? arr.join(' | ') : 'Not Send'}</td>`
                }else if (arr.length <=0){
                    data += `<td class="text-right" style="background: red; color: #fff">${arr.length > 0 ? arr.join(' | ') : 'Not Send ' + '<button class="rewrite btn btn-default btn-sm">Rewrite</button>'}</td>`
                }else{
                    data += `<td class="text-right">${arr.length > 0 ? arr.join(' | ') : 'Not Send'}</td>`
                }
            }
            else {
                data += `<td>${col[obj.field]}</td>`;
            }
        });
        return data;
    },
    getTotal(total){
        let string = '';
        let checkWithAccountExist = this.displayFields.find(x => x.field == 'journalDoc');
        let fieldLength = this.displayFields.length - (checkWithAccountExist ? 3 : 2);
        for (let i = 0; i < fieldLength; i++) {
            string += '<td></td>'
        }
        string += `<td><b>Total:</td></b><td class="text-right"><b>${numeral(total).format('0,0.00')}</b></td>`;
        return string;
    }
});


AutoForm.hooks({
    saleOrderSummary: {
        onSubmit(doc){
            this.event.preventDefault();
            FlowRouter.query.unset();
            let params = {};
            if (doc.fromDate && doc.toDate) {
                let fromDate = moment(doc.fromDate).format('YYYY-MM-DD HH:mm:ss');
                let toDate = moment(doc.toDate).format('YYYY-MM-DD HH:mm:ss');
                params.date = `${fromDate},${toDate}`;
            }
            if (doc.customer) {
                params.customer = doc.customer
            }
            if (doc.filter) {
                params.filter = doc.filter.join(',');
            }
            params.checkWithAccount = `${doc.checkWithAccount}`;
            FlowRouter.query.set(params);
            paramsState.set(FlowRouter.query.params());
            return false;
        }
    }
});
