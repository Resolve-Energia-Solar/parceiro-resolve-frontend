export interface User {
    referral_code: any;
    id: string;
    name: string;
    email: string;
    referrals_count: number;
    created_at: string;
    updated_at: string;
    is_admin: boolean;
  }
  
  export interface RankingUser {
    id: string;
    name: string;
    referral_count: number;
    position?: number;
  }
  