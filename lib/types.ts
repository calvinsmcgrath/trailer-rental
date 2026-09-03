export type PublicTrailer = {
  id: string;
  name: string;
  description: string;
  day_rate: number;
  week_rate: number | null;
  photo_url: string | null;
  sort_order: number;
};

export type Trailer = PublicTrailer & {
  active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  trailer_id: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  price: number;
  contract_signed_name: string;
  contract_signed_at: string;
  signature_ip: string | null;
  signature_user_agent: string | null;
  is_manual: boolean;
  is_block: boolean;
  paid: boolean;
  returned: boolean;
  notes: string;
  cancelled_at: string | null;
  created_at: string;
};

export type BookingWithTrailer = Booking & {
  trailer: Pick<Trailer, "id" | "name"> | null;
};
