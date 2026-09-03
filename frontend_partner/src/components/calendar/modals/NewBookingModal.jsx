import CustomModal from "../../shared/Modals/CustomModal";
import { BookingFormBun } from "../../../pages/protected/admin/Forms/BookingFormBun";

const NewBookingModal = ({ open, onClose, initialCheckIn, initialCheckOut }) => {
  return (
    <CustomModal open={open} onClose={onClose} title="Creează rezervare">
      <BookingFormBun slug="new" initialCheckIn={initialCheckIn} initialCheckOut={initialCheckOut} />
    </CustomModal>
  );
};

export default NewBookingModal;
