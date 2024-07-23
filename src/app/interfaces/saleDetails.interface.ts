export interface SaleDetails{
    id:             string;
    sale_id?:       string;
    inventoryID:    string;
    inventoryName?: string;
    quantity:       number;
    price:          number;
}