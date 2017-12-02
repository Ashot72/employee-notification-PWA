
export interface IUser {
  $key: string;
  id: string,
  categoryId: number;  
  name: string;
  title: string;
  description?: string,
  phone?: string,
  email: string,
  birthDate: string;
  picture: string;  
  location: string;
  regDate: string;
  geoCoordinates?: {
     latitude: number,
     longitude: number
  }
}

