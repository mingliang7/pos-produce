//npm
//schema
import {selectReport} from '../../api/collections/reports/mainReport';
//pages
import './main.html';

let indexTmpl = Template.Cement_mainReport;

indexTmpl.helpers({
    schema(){
        return selectReport;
    },
    selectOptions(){
        return [
            {
                label: 'Invoice', value: 'invoiceReport'
            },
            {
                label: 'Invoice By Customer', value: 'invoiceByCustomerReport'
            },
            {
                label: 'Invoice By Item', value: 'invoiceByItemReport'
            },
            {
                label: 'Bill By Item', value: 'billByItemReport'
            },
            {
                label: 'Receive Payment', value: 'paymentReport'
            },
            {
                label: 'Stock Balance', value: 'stockBalance'
            },
            {
                label: 'Location Transfer', value: 'locationTransfer'
            },
            {
                label: 'Ring Pull Transfer', value: 'ringPullTransfer'
            },
            {
                label: 'Bill', value: 'bill'
            },
            {
                label: 'Bill By Vendor', value: 'billByVendorReport'
            },
            {
                label: 'Prepaid Order', value: 'prepaidOrder'
            },
            {
                label: 'Lending Stock', value: 'lendingStock'
            },
            {
                label: 'Company Exchange Ring Pull', value: 'companyExchangeRingPull'
            },
            {
                label: 'Exchange Gratis', value: 'exchangeGratis'
            },
            {
                label: 'Exchange Ring Pull', value: 'exchangeRingPull'
            },
            {
                label: 'Sale Order', value: 'saleOrder'
            },
            {
                label: 'Group Report', value: 'groupReport'
            },
            {
                label: 'Group Bill Report', value: 'groupBillReport'
            },
            {
                label: 'Customer Term Balance Report', value: 'termCustomerBalance'
            },
            {
                label: 'Customer Group Balance Report', value: 'groupCustomerBalance'
            },
            {
                label: 'Receive Item Summary', value: 'receiveItemSummary'
            },
            {
                label: 'Exchange Ring Pull Stock Balance', value: 'exchangeRingPullStockBalance'
            },
            {
                label: 'Transfer Money', value: 'transferMoney'
            },
        ]
    }
});

indexTmpl.events({
    'change [name="goToReport"]'(event, instance){
        if (event.currentTarget.value != '') {
            FlowRouter.go(getDefaultReportParams(event.currentTarget.value));
        }
    }
});

function getDefaultReportParams(reportName) {
    let params = '';
    switch (reportName) {
        case 'invoiceReport':
            params = `/cement/report/invoice?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}`;
            break;
        case 'invoiceByCustomerReport':
            params = `/cement/report/invoiceByCustomer?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}`;
            break;
        case 'invoiceByItemReport':
            params = `/cement/report/invoiceByItemReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}`;
            break;
        case 'billByItemReport':
            params = `/cement/report/billByItemReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}`;
            break;
        case 'paymentReport':
            params = `/cement/report/payment?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}`;
            break;
        case 'stockBalance':
            params = `/cement/report/stockBalance?date=${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'termCustomerBalance':
            params = `/cement/report/termCustomerBalance?date=${moment().format('YYYY-MM-DD 23:59:59')}`;
            break;
        case 'groupCustomerBalance':
            params = `/cement/report/groupCustomerBalance?date=${moment().format('YYYY-MM-DD 23:59:59')}`;
            break;
        case 'locationTransfer':
            params = `/cement/report/locationTransfer?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&fromBranch=${Session.get('currentBranch')}`;
            break;
        case 'transferMoney':
            params = `/cement/report/transferMoneyReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&fromBranch=${Session.get('currentBranch')}`;
            break;
        case 'ringPullTransfer':
            params = `/cement/report/ringPullTransfer?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&fromBranch=${Session.get('currentBranch')}`;
            break;
        case 'bill':
            params = `/cement/report/billReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'billByVendorReport':
            params = `/cement/report/billByVendorReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'prepaidOrder':
            params = `/cement/report/prepaidOrderReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'exchangeGratis':
            params = `/cement/report/exchangeGratisReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'companyExchangeRingPull':
            params = `/cement/report/companyExchangeRingPullReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'exchangeRingPull':
            params = `/cement/report/exchangeRingPullReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'saleOrder':
            params = `/cement/report/saleOrderReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'groupReport':
            params = `/cement/report/groupReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 00:00:00')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'groupBillReport':
            params = `/cement/report/groupBillReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 00:00:00')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'receiveItemSummary':
            params = `/cement/report/receiveItemSummary?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'lendingStock':
            params = `/cement/report/lendingStockReport?date=${moment().format('YYYY-MM-DD 00:00:00')},${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
            break;
        case 'exchangeRingPullStockBalance':
            params = `/cement/report/exchangeRingPullStockBalance?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
            break;
    }
    return params;
}
