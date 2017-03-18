//component
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//page
import './invoiceByCustomer.html';
//import DI
import  'printthis';
import {JSPanel} from '../../api/libs/jspanel';
//import collection
import {invoiceByCustomerSchema} from '../../api/collections/reports/invoiceByCustomer';

//methods
import {invoiceByCustomerReport} from '../../../common/methods/reports/invoiceByCustomer';
import RangeDate from "../../api/libs/date";
//state
let paramsState = new ReactiveVar();
let invoiceData = new ReactiveVar();
//declare template
let indexTmpl = Template.Cement_invoiceByCustomerReport,
    invoiceDataTmpl = Template.invoiceByCustomerReportData;
indexTmpl.onCreated(function () {
    createNewAlertify('invoiceByCustomer');
    paramsState.set(FlowRouter.query.params());
    this.fromDate = new ReactiveVar(moment().startOf('days').toDate());
    this.endDate = new ReactiveVar(moment().endOf('days').toDate());
    Meteor.setTimeout(function () {
        $("table.fixed-table").fixMe();
    },1000)
    this.autorun(function () {
        if (paramsState.get()) {
            swal({
                title: "Pleas Wait",
                text: "Fetching Data....", showConfirmButton: false
            });
            invoiceByCustomerReport.callPromise(paramsState.get())
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
});
indexTmpl.helpers({
    schema(){
        return invoiceByCustomerSchema;
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
        // alertify.invoiceByCustomer(fa('', ''), renderTemplate(invoiceDataTmpl)).maximize();
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

    display(col){
        let data = '';
        this.displayFields.forEach(function (obj) {
            console.log(col);
            if (obj.field == 'invoiceDate') {
                data += `<td>${moment(col[obj.field]).format('DD/MM/YYYY ')}</td>`
            } else if (obj.field == 'total') {
                data += `<td class="text-right">${numeral(col[obj.field]).format('0,0.00')}</td>`
            } else {
                data += `<td>${col[obj.field]}</td>`;
            }
        });
        return data;
    },
    getTotal(totalQty,total, customerName){
        let string = '';
        let fieldLength = this.displayFields.length - 6;
        for (let i = 0; i < fieldLength; i++) {
            string += '<td></td>'
        }
        string += `<td class="text-center"><u>Total ${_.capitalize(customerName)}:</u></td><td style="border-top: 1px solid black;" class="text-right">${numeral(totalQty).format('0,0.00')}</td><td style="border-top: 1px solid black;"></td ><td style="border-top: 1px solid black;"></td><td style="border-top: 1px solid black;"></td><td style="border-top: 1px solid black;" class="text-right">${numeral(total).format('0,0.00')}</td>`;
        return string;
    },
    getTotalFooter(totalQty,total, totalKhr, totalThb){
        let string = '';
        let fieldLength = this.displayFields.length - 6;
        for (let i = 0; i < fieldLength; i++) {
            string += '<td></td>'
        }
        string += `<td><b>Grand Total:</td></b>
            <td style="1px solid black;" class="text-right"><b>${numeral(totalQty).format('0,0.00')}</b></td>;
            <td style="1px solid black;" class="text-right"></td>;
            <td style="1px solid black;" class="text-right"></td>;
            <td style="1px solid black;" class="text-right"></td>;
            <td style="1px solid black;" class="text-right"><b>${numeral(total).format('0,0.00')}$</b></td>`;
        return string;
    },
    capitalize(customerName){
        return _.capitalize(customerName);
    }
});


AutoForm.hooks({
    invoiceByCustomerReport: {
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

$.fn.fixMe= function() {
    return this.each(function() {
        var $this = $(this),
            $t_fixed;
        function init() {
            $this.wrap('<div class="container-fix-header" />');
            $t_fixed = $this.clone();
            $t_fixed.find("tbody").remove().end().addClass("fixed").insertBefore($this);
            resizeFixed();
        }
        function resizeFixed() {
            $t_fixed.find("th").each(function(index) {
                $(this).css("width",$this.find("th").eq(index).outerWidth()+"px");
            });
        }
        function scrollFixed() {
            var offset = $(this).scrollTop(),
                tableOffsetTop = $this.offset().top,
                tableOffsetBottom = tableOffsetTop + $this.height() - $this.find("thead").height();
            if(offset < tableOffsetTop || offset > tableOffsetBottom)
                $t_fixed.hide();
            else if(offset >= tableOffsetTop && offset <= tableOffsetBottom && $t_fixed.is(":hidden"))
                $t_fixed.show();
        }
        $(window).resize(resizeFixed);
        $(window).scroll(scrollFixed);
        init();
    });
}