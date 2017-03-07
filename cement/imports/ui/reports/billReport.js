//component
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//page
import './billReport.html';
//import DI
import  'printthis';
//import collection
import {billReportSchema} from '../../api/collections/reports/billReport';

//methods
import {billReport} from '../../../common/methods/reports/bill';
//state
let paramsState = new ReactiveVar();
let invoiceData = new ReactiveVar();
//declare template
let indexTmpl = Template.Cement_billReport,
    invoiceDataTmpl = Template.billReportData;
Tracker.autorun(function () {
    if (paramsState.get()) {
        swal({
            title: "Pleas Wait",
            text: "Fetching Data....", showConfirmButton: false
        });
        billReport.callPromise(paramsState.get())
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
    createNewAlertify('showJournal');
    paramsState.set(FlowRouter.query.params());
});
indexTmpl.helpers({
    schema(){
        return billReportSchema;
    }
});
indexTmpl.events({
    'click .print'(event, instance){
        $('#to-print').printThis();
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
            if (obj.field == 'enterBillDate') {
                data += `<td>${moment(col[obj.field]).format('YYYY-MM-DD HH:mm:ss')}</td>`
            } else if (obj.field == 'vendorId') {
                data += `<td>${col._vendor.name}</td>`
            } else if (obj.field == 'total') {
                data += `<td>${numeral(col[obj.field]).format('0,0.00')}</td>`
            }else if (obj.field == 'journalDoc'){
                let arr = [];
                col[obj.field].map(function(e){
                     e.refFrom == 'EnterBill' && arr.push(
                        "<a class='cursor-pointer journalId'" + 'journalId="'+ e._id + '">' + e._id + "</a>"
                     )
                })
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
        let fieldLength = this.displayFields.length - 2;
        for (let i = 0; i < fieldLength; i++) {
            string += '<td></td>'
        }
        string += `<td><b>Total:</td></b><td><b>${numeral(total).format('0,0.00')}</b></td>`;
        return string;
    }
});
invoiceDataTmpl.events({
    'click .journalId'(event,instance){
       let journalId = $(event.currentTarget).attr('journalId');
       $.blockUI();
       Meteor.call('getJournal', {_id: journalId}, function (err, data) {
           alertify.showJournal(fa("eye", "Journal"), renderTemplate(Template.acc_journalShow, data).html);
       })
       $.unblockUI();
    }
});

AutoForm.hooks({
    billReport: {
        onSubmit(doc){
            this.event.preventDefault();
            FlowRouter.query.unset();
            let params = {};
            if (doc.fromDate && doc.toDate) {
                let fromDate = moment(doc.fromDate).startOf('days').format('YYYY-MM-DD HH:mm:ss');
                let toDate = moment(doc.toDate).endOf('days').format('YYYY-MM-DD HH:mm:ss');
                params.date = `${fromDate},${toDate}`;
            }
            if (doc.vendorId) {
                params.vendorId = doc.vendorId;
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