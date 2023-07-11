export interface Transaction {
    id: string;
    amount: number;
    date: {
        nanoseconds: number;
        seconds: number;
    };
    issued_by: {
        id: string;
        name: string;
    };
    payment_id: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    last_login: any;
    password: string;
    role: 'user' | 'production-manager'|'sales-manager',
    last_logout: any,
}

export interface Admin extends Pick<User, "id"|"name"|"role"> {
    logo: string;
}

export enum FirebaseCollections {
    Productions = "productions",
    Products = "products",
    Invoices = "invoices",
    Reciepts = "receipts",
    Staff = "users",
    Stock = "stock",
}

export enum ReactQueryKeys {
    AdminUser = "admin-user"
}


export interface Product {
    id?: string;
    name: string;
    price: number;
}

interface ProductionForProduct extends Product {
    quantity_produced: number;
}

export interface SalesForProduct extends Product {
    quantity_sold: number;
}

export interface Production {
    id: string;
    data: any;
    bags_used: number;
    expected_revenue: number;
    timestamp: any;
}

export type SalesStatus = "paid"|"unpaid"|"part-payment"
export interface Sales {
    id: string;
    payment_reference: string;
    data: SalesForProduct[];
    revenue_made: number;
    timestamp: any;
    status: SalesStatus;
    recipient: string;
}

export interface Stock {
    bags_left: number;
}