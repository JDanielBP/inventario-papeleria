export interface SaleDetails{
    id:             string;
    sale_id?:       string;
    inventoryId:    string;
    inventoryName?: string;
    quantity:       number;
    price:          number;
}