export interface Inventory{
    id:             string;
    categoryID?:    string;
    unitID:         string;
    name:           string;
    price:          number;
    stock:          number;
    date:           Date | null;
}