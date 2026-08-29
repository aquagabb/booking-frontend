import CustomModal from "../../shared/Modals/CustomModal";
import Overview from "../../../pages/protected/admin/Bookings/Overview";

const BookingDetailsModal = ({ open, onClose, bookingId }) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Booking Details"
      className="relative bg-white rounded-xl h-[90vh] w-[75vw] flex flex-col overflow-hidden"
    >
      {bookingId && <Overview bookingId={bookingId} />}
    </CustomModal>
  );
};

export default BookingDetailsModal;
