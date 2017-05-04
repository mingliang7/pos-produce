import {CompanyExchangeRingPulls} from '../../imports/api/collections/companyExchangeRingPull.js';

// Lib
import './_init.js';

CompanyExchangeRingPulls.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
CompanyExchangeRingPulls.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
CompanyExchangeRingPulls.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
