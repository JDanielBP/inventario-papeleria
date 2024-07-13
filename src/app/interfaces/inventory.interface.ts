export interface Inventory{
    id:         string;
    name:       string;
    category:   string;
    price:      number;
    stock:      number;
    unit:       string;
    date:       Date | null;
}