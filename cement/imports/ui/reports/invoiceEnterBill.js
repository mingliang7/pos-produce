//component
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//page
import './invoiceEnterBill.html';
//import DI
import  'printthis';
import {JSPanel} from '../../api/libs/jspanel';
//import collection
import {invoiceEnterBillSchema} from '../../api/collections/reports/invoiceEnterBill';

//methods
import {invoiceEnterBillReport} from '../../../common/methods/reports/invoiceEnterBill';
import RangeDate from "../../api/libs/date";
//state
let paramsState = new ReactiveVar();
let invoiceData = new ReactiveVar();
//declare template
let indexTmpl = Template.Cement_invoiceEnterBillReport,
    invoiceDataTmpl = Template.invoiceEnterBillReportData;
Tracker.autorun(function () {
    if (paramsState.get()) {
        swal({
            title: "Pleas Wait",
            text: "Fetching Data....", showConfirmButton: false
        });
        invoiceEnterBillReport.callPromise(paramsState.get())
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
    createNewAlertify('invoiceEnterBill');
    paramsState.set(FlowRouter.query.params());
    this.fromDate = new ReactiveVar(moment().startOf('days').toDate());
    this.endDate = new ReactiveVar(moment().endOf('days').toDate());
});
indexTmpl.helpers({
    schema(){
        return invoiceEnterBillSchema;
    },
    fromDate(){
        let instance = Template.instance();
        return instance.fromDate.get();
    },
    endDate(){
        let instance = Template.instance();
        return instance.endDate.get();
    }
});

indexTmpl.events({
    'click .fullScreen'(event, instance){
        $('.sub-body').addClass('rpt rpt-body');
        $('.sub-header').addClass('rpt rpt-header');
        // alertify.invoiceEnterBill(fa('', ''), renderTemplate(invoiceDataTmpl)).maximize();
        let arrFooterTool = [
            {
                item: "<button type='button'></button>",
                event: "click",
                btnclass: 'btn btn-sm btn-primary',
                btntext: 'Print',
                callback: function (event) {
                    setTimeout(function () {
                        $('#invoice-by-customer').printThis();
                    }, 500);
                }
            }
        ];
        JSPanel(
            {
                title: 'Invoice By Customer',
                content: renderTemplate(invoiceDataTmpl).html,
                footer: arrFooterTool
            }
        ).maximize();
    },
    'change #date-range-filter'(event, instance){
        let currentRangeDate = RangeDate[event.currentTarget.value]();
        instance.fromDate.set(currentRangeDate.start.toDate());
        instance.endDate.set(currentRangeDate.end.toDate());
    },
    'click .printReport'(event,instance){
        window.print();
    }
});

invoiceDataTmpl.onDestroyed(function () {
    $('.sub-body').removeClass('rpt rpt-body');
    $('.sub-header').removeClass('rpt rpt-header');
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
    capitalize(customerName){
        return _.capitalize(customerName);
    },
    enterBillExist(refBillId){
        return !!refBillId;
    }
});


AutoForm.hooks({
    invoiceEnterBillReport: {
        onSubmit(doc){
            this.event.preventDefault();
            FlowRouter.query.unset();
            let params = {};
            params.branchId = Session.get('currentBranch');
            if(doc.branchId) {
                params.branchId = doc.branchId.join(',');
            }
            if (doc.fromDate && doc.toDate) {
                let fromDate = moment(doc.fromDate).startOf('days').format('YYYY-MM-DD HH:mm:ss');
                let toDate = moment(doc.toDate).endOf('days').format('YYYY-MM-DD HH:mm:ss');
                params.date = `${fromDate},${toDate}`;
            }
            if (doc.customer) {
                params.customer = doc.customer
            }
            if (doc.filter) {
                params.filter = doc.filter.join(',');
            }
            if (doc.itemId) {
                params.items = doc.itemId.join(',');
            }
            FlowRouter.query.set(params);
            paramsState.set(FlowRouter.query.params());
            return false;
        }
    }
});