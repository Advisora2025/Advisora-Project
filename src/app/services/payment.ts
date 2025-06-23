export interface Payment {
  id: number;
  session_id: number;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
}
