import pool from "@/lib/db-mysql";
import BookingsManager from "@/components/bookings/bookings-manager";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  let bookings: any[] = [];
  let venues: any[] = [];
  let resources: any[] = [];

  try {
    // 1. READ: Fetch all bookings with joined venue, user, and department details
    const [bookingRows]: any = await pool.query(
      `SELECT b.booking_id, b.start_time, b.end_time, b.status,
              v.name as venue_name, v.location,
              u.full_name as requester_name,
              d.dept_name
       FROM BOOKINGS b
       JOIN VENUES v ON b.venue_id = v.venue_id
       JOIN USERS u ON b.user_id = u.user_id
       JOIN DEPARTMENTS d ON b.dept_id = d.dept_id
       ORDER BY b.booking_id DESC`
    );
    bookings = bookingRows;

    // 2. Fetch Venues for CREATE operation
    const [venueRows]: any = await pool.query(
      `SELECT venue_id, name, location, capacity, requires_approval, dept_id FROM VENUES ORDER BY name ASC`
    );
    venues = venueRows;

    // 3. Fetch Resources for CREATE operation
    const [resourceRows]: any = await pool.query(
      `SELECT resource_id, resource_name, total_quantity FROM RESOURCES ORDER BY resource_name ASC`
    );
    resources = resourceRows;
  } catch (err) {
    console.error("Could not query booking logistics from MySQL", err);
  }

  return (
    <BookingsManager 
      initialBookings={bookings} 
      venues={venues} 
      resources={resources} 
    />
  );
}
