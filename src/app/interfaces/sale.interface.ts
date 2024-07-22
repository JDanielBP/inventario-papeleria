import { SaleDetail } from "./saleDetail.interface";

export interface Sale{
    id:         string;
    customer:   string;
    total:      number;
    date:       Date;
    saleDetail: SaleDetail[];
}

