//component
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//page
import './vendorGroupHistory.html';
//import DI
import  'printthis';
//import collection
import {vendorGroupHistorySchema} from '../../api/collections/reports/vendorHistoryGroup';

//methods
import {vendorGroupHistoryReport} from '../../../common/methods/reports/vendorGroupHistory';
import RangeDate from "../../api/libs/date";
//state
let paramsState = new ReactiveVar();
let invoiceData = new ReactiveVar();
//declare template
let indexTmpl = Template.PPOS_vendorGroupHistory,
    invoiceDataTmpl = Template.vendorGroupHistoryData;
Tracker.autorun(function () {
    if (paramsState.get()) {
        swal({
            title: "Pleas Wait",
            text: "Fetching Data....", showConfirmButton: false
        });
        vendorGroupHistoryReport.callPromise(paramsState.get())
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
    createNewAlertify('vendorHistory');
    paramsState.set(FlowRouter.query.params());
    this.fromDate = new ReactiveVar(moment().startOf('days').toDate());
    this.endDate = new ReactiveVar(moment().endOf('days').toDate());
});
indexTmpl.helpers({
    schema(){
        return vendorGroupHistorySchema;
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
        $('.rpt-header').addClass('rpt');
        $('.rpt-body').addClass('rpt');
        $('.sub-body').addClass('rpt rpt-body');
        $('.sub-header').addClass('rpt rpt-header');
        let arrFooterTool = [
            {
                item: "<button type='button'></button>",
                event: "click",
                btnclass: 'btn btn-sm btn-primary',
                btntext: 'Print',
                callback: function (event) {
                    setTimeout(function () {
                        $('#to-print').printThis();
                    }, 500);
                }
            }
        ];
        JSPanel({footer: arrFooterTool,title: 'vendor History', content: renderTemplate(invoiceDataTmpl).html}).maximize();
    },
    'change #date-range-filter'(event, instance){
        let currentRangeDate = RangeDate[event.currentTarget.value]();
        instance.fromDate.set(currentRangeDate.start.toDate());
        instance.endDate.set(currentRangeDate.end.toDate());
    },
});
invoiceDataTmpl.events({
    'click .print'(event, instance){
        $('#to-print').printThis();
    }
});
invoiceDataTmpl.onDestroyed(function () {
    $('.rpt-header').removeClass('rpt');
    $('.rpt-body').removeClass('rpt');
    $('.sub-body').removeClass('rpt rpt-body');
    $('.sub-header').removeClass('rpt rpt-header');
});
invoiceDataTmpl.helpers({
    data(){
        if (invoiceData.get()) {
            return invoiceData.get();
        }
    },
    company(){
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        return doc.company;
    },
    hasFilterDate(date){
        let paramsFilterDate = FlowRouter.query.get('filterDate');
        let startDate;
        let endDate;
        if(paramsFilterDate){
            startDate = moment(paramsFilterDate).startOf('months').format('YYYY-MM-DD');
            endDate = moment(paramsFilterDate).endOf('months').format('YYYY-MM-DD');
        }
        let currentViewDate = moment(date);
        console.log(currentViewDate.isSameOrBefore(endDate))
        debugger
        if (paramsFilterDate) {
            if (currentViewDate.isSameOrAfter(startDate) && currentViewDate.isSameOrBefore(endDate)) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    },
});


AutoForm.hooks({
    vendorGroupHistoryReport: {
        onSubmit(doc){
            this.event.preventDefault();
            FlowRouter.query.unset();
            let params = {};
            if (doc.asDate) {
                params.date = `${moment(doc.asDate).startOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
            }
            if (doc.vendor) {
                params.vendor = doc.vendor
            }
            if (doc.filter) {
                params.filter = doc.filter.join(',');
            }
            if (doc.filterDate) {
                params.filterDate = moment(doc.filterDate).endOf('days').format('YYYY-MM-DD HH:mm:ss');
            }
            FlowRouter.query.set(params);
            paramsState.set(FlowRouter.query.params());
            return false;
        }
    }
});