export interface BookingPolicy {
  isBookingAllowed(
    property_id: string,
    check_in: Date,
    check_out: Date
  ): Promise<boolean>;
}
