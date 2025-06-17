

// For API data

interface Image {
    url:string
}
export interface MenuItem {
    title:string,
    price:string,
    description:string,
    category:string,
    image:Image
}

// for database rows 
export interface MenuItemRow {
    id: number;
    title:string,
    price:string,
    description:string,
    category:string
    image:string
}

// For section list display 

export interface MenuItemDisplay {
    
    title:string,
    price:string,
    category:string,
    image:string,
    description:string,
    key?:string
}

