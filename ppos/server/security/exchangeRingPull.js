import {ExchangeRingPulls} from '../../imports/api/collections/exchangeRingPull.js';

// Lib
import './_init.js';

ExchangeRingPulls.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
ExchangeRingPulls.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
ExchangeRingPulls.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
