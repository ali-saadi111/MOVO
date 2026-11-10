import type { Campaign, MovoEvent, Notification, Place, Product, ProductCategory, Slot, Specialist, ServiceKind } from '../models';

export type ProductQuery = { category?: ProductCategory; subcategory?: string; search?: string; ids?: string[] };

export interface PlacesRepo {
  list(): Promise<Place[]>;
  get(id: string): Promise<Place>;
}
export interface ProductsRepo {
  list(q?: ProductQuery): Promise<Product[]>;
  get(id: string): Promise<Product>;
}
export interface CareRepo {
  specialists(kind?: ServiceKind): Promise<Specialist[]>;
  specialist(id: string): Promise<Specialist>;
  slots(specialistId: string, day: string): Promise<Slot[]>;
}
export interface CommunityRepo {
  events(): Promise<MovoEvent[]>;
  event(id: string): Promise<MovoEvent>;
  campaigns(): Promise<Campaign[]>;
  campaign(id: string): Promise<Campaign>;
}
export interface NotificationsRepo {
  list(): Promise<Notification[]>;
}
