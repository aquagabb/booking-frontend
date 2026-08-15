import React from "react";
import { useNavigate } from "react-router-dom";
import ReservationItem from "./ReservationItem";
import type { Reservation } from "./types";

type Props = {
  items: Reservation[];
};

const ReservationList: React.FC<Props> = ({ items }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No reservations available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((res) => (
        <ReservationItem
          key={res.id}
          reservation={res}
          activeTab="current" 
          onClick={() => navigate(`/booking/view/${res.id}/${res.code}`)}
        />
      ))}
    </div>
  );
};

export default ReservationList;
