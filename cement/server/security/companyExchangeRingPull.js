import {CompanyExchangeRingPulls} from '../../imports/api/collections/companyExchangeRingPull.js';

// Lib
import './_init.js';

CompanyExchangeRingPulls.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
CompanyExchangeRingPulls.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
CompanyExchangeRingPulls.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
