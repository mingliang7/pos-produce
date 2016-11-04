import {ExchangeRingPulls} from '../../imports/api/collections/exchangeRingPull.js';

// Lib
import './_init.js';

ExchangeRingPulls.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
ExchangeRingPulls.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
ExchangeRingPulls.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
