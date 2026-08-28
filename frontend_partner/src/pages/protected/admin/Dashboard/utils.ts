export const getCurrentDate = () => new Date();

export const pendingStatusLabel = (status: string): string => {
  switch (status) {
    case 'awaiting_client':
      return 'În ofertare';
    case 'on_hold':
      return 'În așteptare / blocat';
    case 'pending':
    default:
      return 'Așteaptă confirmare';
  }
};
