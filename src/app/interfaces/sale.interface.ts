import { SaleDetails } from "./saleDetails.interface";

export interface Sale{
    id:         string;
    customer:   string;
    total:      number;
    date:       Date | null;
    saleDetail?: SaleDetails[];
}