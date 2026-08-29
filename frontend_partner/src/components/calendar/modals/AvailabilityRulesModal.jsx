import CustomModal from "../../shared/Modals/CustomModal";
import AvailabilitySettings from "../../../pages/protected/admin/Locations/AvailabilitySettings";

const AvailabilityRulesModal = ({ open, onClose, locationId }) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Reguli de disponibilitate"
      className="relative bg-white dark:bg-gray-900 rounded-xl h-[90vh] w-full max-w-4xl flex flex-col overflow-hidden"
    >
      {locationId && <AvailabilitySettings slug={locationId} />}
    </CustomModal>
  );
};

export default AvailabilityRulesModal;
