export interface Users {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    token?: string;
    profileImage?: string;  
    updatedAt?: Date; 
}