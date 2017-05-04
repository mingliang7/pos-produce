//component
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//page
import './billByItem.html';
//import DI
import  'printthis';
//import collection
import {billReportSchema} from '../../api/collections/reports/billReport';

//methods
import {billByItemReport} from '../../../common/methods/reports/billByItem';
//state
let paramsState = new ReactiveVar();
let invoiceData = new ReactiveVar();
//declare template
let indexTmpl = Template.PPOS_billByItemReport,
    invoiceDataTmpl = Template.billByItemReportData;
Tracker.autorun(function () {
    if (paramsState.get()) {
        swal({
            title: "Pleas Wait",
            text: "Fetching Data....", showConfirmButton: false
        });
        billByItemReport.callPromise(paramsState.get())
            .then(function (result) {
                invoiceData.set(result);
                setTimeout(function () {
                    swal.close()
                }, 200);
            }).catch(function (err) {
            swal.close();
            console.log(err.message);
        })
    }
});

indexTmpl.onCreated(function () {
    createNewAlertify('invoiceReport');
    Session.set('vendorFilter', 'Term');
    paramsState.set(FlowRouter.query.params());
});

indexTmpl.onDestroyed(function () {
    Session.set('vendorFilter', undefined);
});

indexTmpl.helpers({
    schema(){
        return billReportSchema;
    }
});

indexTmpl.events({
    'click .print'(event, instance){
        $('#to-print').printThis();
    },
    'change [name="type"]'(event,instance){
        Session.set('vendorFilter', event.currentTarget.value);
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
            if (obj.field == 'billDate') {
                data += `<td>${moment(col[obj.field]).format('YYYY-MM-DD HH:mm:ss')}</td>`
            } else if (obj.field == 'vendorId') {
                data += `<td>${col._vendor.name}</td>`
            } else if (obj.field == 'total') {
                data += `<td>${numeral(col[obj.field]).format('0,0.00')}</td>`
            }
            else {
                data += `<td>${col[obj.field]}</td>`;
            }
        });

        return data;
    },
    getTotal(total, customerName){
        let string = '';
        let fieldLength = this.displayFields.length - 2;
        for (let i = 0; i < fieldLength; i++) {
            string += '<td></td>'
        }
        string += `<td><u>Total ${_.capitalize(customerName)}:</u></td><td><u>${numeral(total).format('0,0.00')}</u></td>`;
        return string;
    },
    getTotalFooter(total, totalKhr, totalThb){
        let string = '';
        let fieldLength = this.displayFields.length - 4;
        for (let i = 0; i < fieldLength; i++) {
            string += '<td></td>'
        }
        string += `<td><b>Total:</td></b><td><b>${numeral(totalKhr).format('0,0')}<small>៛</small></b></td><td><b>${numeral(totalThb).format('0,0')}B</b></td><td><b>${numeral(total).format('0,0.00')}$</b></td>`;
        return string;
    },
    capitalize(customerName){
        return _.capitalize(customerName);
    }
});


AutoForm.hooks({
    billByItemReport: {
        onSubmit(doc){
            this.event.preventDefault();
            FlowRouter.query.unset();
            let params = {};
            if (doc.fromDate && doc.toDate) {
                let fromDate = moment(doc.fromDate).format('YYYY-MM-DD HH:mm:ss');
                let toDate = moment(doc.toDate).format('YYYY-MM-DD HH:mm:ss');
                params.date = `${fromDate},${toDate}`;
            }
            if (doc.vendorId) {
                params.vendor = doc.vendorId;
            }
            console.log(doc);
            if(doc.type) {
                params.type = doc.type
            }else{
                params.type = 'Term';
            }
            if (doc.filter) {
                params.filter = doc.filter.join(',');
            }
            if(doc.status){
                params.status = doc.status.join(',');
            }
            FlowRouter.query.set(params);
            paramsState.set(FlowRouter.query.params());
            return false;
        }
    }
});