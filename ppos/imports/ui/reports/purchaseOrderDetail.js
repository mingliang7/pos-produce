//component
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//page
import './purchaseOrderDetail.html';
//import DI
import  'printthis';
//import collection
import {purchaseOrderDetailSchema} from '../../api/collections/reports/purchaseOrderDetail';

//methods
import {purchaseOrderDetailMethod} from '../../../common/methods/reports/purchaseOrderDetail';
import RangeDate from "../../api/libs/date";
//state
let paramsState = new ReactiveVar();
let invoiceData = new ReactiveVar();
//declare template
let indexTmpl = Template.PPOS_purchaseOrderDetail,
    invoiceDataTmpl = Template.purchaseOrderDetailData;
indexTmpl.onCreated(function () {
    createNewAlertify('purchaseOrderDetail');
    paramsState.set(FlowRouter.query.params());
    this.purchaseOrderItem = new ReactiveVar([]);
    this.fromDate = new ReactiveVar(moment().startOf('days').toDate());
    this.endDate = new ReactiveVar(moment().endOf('days').toDate());
    this.autorun(()=>{
        if (paramsState.get()) {
        swal({
            title: "Pleas Wait",
            text: "Fetching Data....", showConfirmButton: false
        });
        purchaseOrderDetailMethod.callPromise(paramsState.get())
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
    })
});
indexTmpl.helpers({
    schema(){
        return purchaseOrderDetailSchema;
    },
    fromDate(){
        let instance = Template.instance();
        return instance.fromDate.get();
    },
    endDate(){
        let instance = Template.instance();
        return instance.endDate.get();
    },
    getPurchaseOrderItem(){
        let instance = Template.instance();
        return instance.purchaseOrderItem.get();
    }
});
indexTmpl.events({
    'change #date-range-filter'(event, instance){
        let currentRangeDate = RangeDate[event.currentTarget.value]();
        instance.fromDate.set(currentRangeDate.start.toDate());
        instance.endDate.set(currentRangeDate.end.toDate());
    },
    'click .printReport'(event, instance){
        window.print();
    },
    'change [name="purchaseOrder"]'(event,instance){
        let currentValue = event.currentTarget.value;
        if(currentValue != '') {
            Meteor.call('getPurchaseOrderItemList', {purchaseOrderId: currentValue}, function (err, result) {
                instance.purchaseOrderItem.set(result);
            });
        }else{
            instance.purchaseOrderItem.set([]);
        }
    }
});

invoiceDataTmpl.onDestroyed(function () {
    $('.rpt-header').removeClass('rpt');
    $('.rpt-body').removeClass('rpt');
    $('.sub-body').removeClass('rpt rpt-body');
    $('.sub-header').removeClass('rpt rpt-header');
});
invoiceDataTmpl.onRendered(function () {
    Meteor.setTimeout(function () {
        $("table.fixed-table").fixMe();
    },1000);
});
invoiceDataTmpl.helpers({
    existPayment(paymentDate){
        return !!paymentDate;
    },
    hasFilterDate(date){
        let paramsFilterDate = FlowRouter.query.get('filterDate');
        let filterDate = paramsFilterDate ? moment(paramsFilterDate).startOf('months').format('DD/MM/YY') : null;
        let currentViewDate = moment(date).startOf('months');
        if (paramsFilterDate) {
            if (currentViewDate.isSameOrAfter(filterDate)) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    },
    data(){
        if (invoiceData.get()) {
            let purchaseOrderDetail = invoiceData.get();
            return purchaseOrderDetail;
        }
    },
    concatInvoiceId(val){
        if(val && val.length <= 8){
            return val;
        }
        return val.substr(val.length - 10, val.length - 1);
    },
    company(){
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        return doc.company;
    },
    checkRemain(remain, amount){
        if(remain > 0){
            return numeral(amount).format('0,0.00');
        }
        return 0;
    }
});


AutoForm.hooks({
    purchaseOrderDetailReport: {
        onSubmit(doc){
            this.event.preventDefault();
            FlowRouter.query.unset();
            let params = {};
            if(doc.vendor){
                params.vendor = doc.vendor;
            }
            if (doc.customer) {
                params.customer = doc.customer
            }
            if (doc.purchaseOrder) {
                params.po = doc.purchaseOrder;
            }
            if(doc.itemId) {
                params.itemId = doc.itemId;
            }
            FlowRouter.query.set(params);
            paramsState.set(FlowRouter.query.params());
            return false;
        }
    }
});

//Copyright by kevin
$.fn.fixMe = function () {
    return this.each(function () {
        var $this = $(this),
            $t_fixed;

        function init() {
            $this.wrap('<div class="container-fix-header" />');
            $t_fixed = $this.clone();
            $t_fixed.find("tbody").remove().end().addClass("fixed").insertBefore($this);
            resizeFixed();
        }

        function resizeFixed() {
            $t_fixed.find("th").each(function (index) {
                $(this).css("width", $this.find("th").eq(index).outerWidth() + "px");
            });
        }

        function scrollFixed() {
            var offset = $(this).scrollTop(),
                tableOffsetTop = $this.offset().top,
                tableOffsetBottom = tableOffsetTop + $this.height() - $this.find("thead").height();
            if (offset < tableOffsetTop || offset > tableOffsetBottom)
                $t_fixed.hide();
            else if (offset >= tableOffsetTop && offset <= tableOffsetBottom && $t_fixed.is(":hidden"))
                $t_fixed.show();
        }

        $(window).resize(resizeFixed);
        $(window).scroll(scrollFixed);
        init();
    });
}