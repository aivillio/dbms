export type UserRole = 'STUDENT' | 'FACULTY_ORGANIZER' | 'DEPT_ADMIN' | 'SUPER_ADMIN';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Department {
  dept_id: number;
  dept_name: string;
  code: string;
}

export interface User {
  user_id: number;
  dept_id: number | null;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Venue {
  venue_id: number;
  dept_id: number | null;
  name: string;
  location: string;
  capacity: number;
  requires_approval: boolean;
  dept_name?: string;
  code?: string;
  semanticRelevance?: string;
}

export interface Resource {
  resource_id: number;
  resource_name: string;
  total_quantity: number;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  venue_id: number;
  dept_id: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  user_name?: string;
  venue_name?: string;
  dept_name?: string;
}

export interface BookingResource {
  booking_id: number;
  resource_id: number;
  quantity_allocated: number;
  resource_name?: string;
}

export interface ApprovalLog {
  log_id: number;
  booking_id: number;
  approver_id: number;
  action_status: 'APPROVED' | 'REJECTED';
  comments: string | null;
  timestamp: string;
}
