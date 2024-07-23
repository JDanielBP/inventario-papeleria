export interface InventoryInfo{
    id:         string;
    category?:  string;
    unit:       string;
    name:       string;
    price:      number;
    stock:      number;
    date:       Date | null;
}