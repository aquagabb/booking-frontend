import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import CustomInput from './shared/CustomInput';
import CustomSelect from './shared/CustomSelect';
import CustomCheckbox from './shared/CustomCheckbox';
import CustomDatePicker from './shared/CustomDatePicker';
import CustomTimePicker from './shared/CustomTimePicker';
import CustomRadioButton from './shared/CustomRadioButton';
import { checkoutBooking } from '../api/bookings/bookings';
import { toSelectOptions } from '../lib/utils';
import { useUserStore } from '../store/user.store';
import { Calendar, Clock } from 'lucide-react';

type SelectOption = { value: string | number; label: string };

type PricingItem = {
  currency: string;
  defaultMode: "per_time" | "per_guest";
  hour?: {
    price: number;
    min?: number;
  };
  day?: {
    price: number;
    min?: number;
  };
  guest?: {
    price: number;
    min?: number;
  };
};

type Category = {
  id: number;
  name: string;
};

type PricingCategory = {
  id: number;
  categoryId: number;
  pricing: PricingItem[];
};

interface ReservationProps {
  slug: string;
  locationId?: number;
  viewMode: string;
  pricePerDay?: number;
  guests?: number;
  startDate?: string;
  endDate?: string;
  pricing?: PricingItem[];
  pricingCategories?: PricingCategory[];
  categories?: Category[];
  onFormChange?: (data: Partial<FormValues> & { categoryName?: string }) => void;
  minim_hours?: number | null;
  minim_days?: number | null;
  minim_guests?: number | null;
}

type FormValues = {
  categoryId: number;
  locationId: number;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  createAccount: boolean;
};

const ReservationRight: React.FC<ReservationProps> = ({
  slug,
  locationId,
  viewMode = false,
  pricePerDay = 0,
  guests: maxGuests = 50,
  startDate,
  endDate,
  pricing = [],
  pricingCategories = [],
  categories = [],
  onFormChange,
  minim_hours = null,
  minim_days = null,
  minim_guests = null
}) => {

  const isCheckout = viewMode === 'checkout';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUserStore((state) => state.user);

  const defaultPricingData = pricing && pricing.length > 0 ? pricing[0] : null;

  const getBookingData = () => {
    const bookingData: {
      checkIn?: string;
      checkOut?: string;
      startTime?: string;
      endTime?: string;
      guests?: number;
      bookingType?: string;
      categoryId?: number;
    } = {};

    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const startTimeParam = searchParams.get('startTime');
    const endTimeParam = searchParams.get('endTime');
    const guestsParam = searchParams.get('guests');
    const bookingTypeParam = searchParams.get('bookingType');
    const eventTypeParam = searchParams.get('eventType');

    let storedData: any = null;
    try {
      const stored = localStorage.getItem('booking-data');
      if (stored) {
        storedData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading booking data from localStorage:', error);
    }

    bookingData.checkIn = checkInParam || storedData?.checkIn;
    bookingData.checkOut = checkOutParam || storedData?.checkOut;
    bookingData.startTime = startTimeParam || storedData?.startTime;
    bookingData.endTime = endTimeParam || storedData?.endTime;
    bookingData.bookingType = bookingTypeParam || storedData?.bookingType;
    
    if (eventTypeParam) {
      const categoryIdNum = parseInt(eventTypeParam, 10);
      if (!isNaN(categoryIdNum)) {
        bookingData.categoryId = categoryIdNum;
      }
    } else if (storedData?.categoryId) {
      bookingData.categoryId = storedData.categoryId;
    }
    
    if (guestsParam) {
      const guestsNum = parseInt(guestsParam, 10);
      if (!isNaN(guestsNum)) {
        bookingData.guests = guestsNum;
      }
    } else if (storedData?.guests) {
      bookingData.guests = storedData.guests;
    }

    return bookingData;
  };

  const bookingData = getBookingData();

  const getCurrentTimeRounded = (): string => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    const remainder = minutes % 15;
    if (remainder !== 0) {
      minutes = minutes + (15 - remainder);
      if (minutes >= 60) {
        minutes = 0;
        hours = (hours + 1) % 24;
      }
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const addHoursToTime = (time: string, hoursToAdd: number): string => {
    const [hours, minutes] = time.split(':').map(Number);
    let newHours = hours + hoursToAdd;
    if (newHours >= 24) {
      newHours = newHours % 24;
    }
    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getInitialCheckIn = (): Date => {
    const now = new Date();
    const todayDate = new Date(now);
    todayDate.setHours(0, 0, 0, 0);
    
    if (startDate) {
      const date = new Date(startDate);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date;
      }
    }
    if (bookingData.checkIn) {
      const date = new Date(bookingData.checkIn);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date;
      }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getInitialCheckOut = (): Date => {
    const now = new Date();
    const todayDate = new Date(now);
    todayDate.setHours(0, 0, 0, 0);
    
    if (endDate) {
      const date = new Date(endDate);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date;
      }
    }
    if (bookingData.checkOut) {
      const date = new Date(bookingData.checkOut);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date;
      }
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const getInitialBookingType = (): string => {
    const initialCatId = bookingData?.categoryId ?? 0;
    const initialEntry = pricingCategories?.find((pc) => pc.categoryId === initialCatId);
    const initialPricing = initialEntry?.pricing?.[0] ?? defaultPricingData;
    const mode = initialPricing?.defaultMode || 'per_time';
    const isPerTimeInit = mode === 'per_time';
    const hasHourlyInit = isPerTimeInit && (initialPricing?.hour?.price != null);
    const hasDailyInit = isPerTimeInit && (initialPricing?.day?.price != null);
    const hasGuestInit = mode === 'per_guest' && (initialPricing?.guest?.price != null);

    if (bookingData.bookingType) {
      if (isPerTimeInit && (bookingData.bookingType === 'hour' || bookingData.bookingType === 'day')) {
        if (bookingData.bookingType === 'hour' && hasHourlyInit) return 'hour';
        if (bookingData.bookingType === 'day' && hasDailyInit) return 'day';
      }
      if (hasGuestInit && bookingData.bookingType === 'guest') return 'guest';
    }
    if (isPerTimeInit) return hasHourlyInit ? 'hour' : 'day';
    return 'guest';
  };

  const DEFAULT_END_TIME_OFFSET_HOURS = 1;

  const getInitialStartTime = (): string => {
    const initialCheckIn = getInitialCheckIn();
    if (isToday(initialCheckIn)) {
      return getCurrentTimeRounded();
    }
    return bookingData.startTime || '22:00';
  };

  const getInitialEndTime = (startTimeValue: string): string => {
    if (bookingData.endTime) {
      return bookingData.endTime;
    }
    const [hours, minutes] = startTimeValue.split(':').map(Number);
    let newHours = hours + DEFAULT_END_TIME_OFFSET_HOURS;
    if (newHours >= 24) {
      newHours = newHours % 24;
    }
    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const [bookingType, setBookingType] = useState<string>(getInitialBookingType);
  const [checkInDate, setCheckInDate] = useState<Date | null>(getInitialCheckIn());
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(getInitialCheckOut());
  const initialStartTime = getInitialStartTime();
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(getInitialEndTime(initialStartTime));

  const getUserData = (currentUser: typeof user) => {
    try {
      const userStorage = localStorage.getItem('user-storage');
      if (userStorage) {
        const parsed = JSON.parse(userStorage);
        const userData = parsed?.state?.user;
        if (userData) {
          return {
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          };
        }
      }
    } catch (error) {
      console.error('Error reading user data from localStorage:', error);
    }
    return {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: (currentUser as any)?.phone || '',
    };
  };

  const userData = getUserData(user);


  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      categoryId: bookingData.categoryId || 0,
      locationId: locationId || 0,
      guests: bookingData.guests || 0,
      customerName: userData.name || '',
      customerEmail: userData.email || '',
      customerPhone: userData.phone || '',
      checkIn: '',
      checkOut: '',
      createAccount: true,
    },
  });

  const watchedValues = watch();

  const categoryId = watchedValues?.categoryId ?? bookingData?.categoryId ?? 0;
  const categoryPricingEntry = pricingCategories?.find((pc) => pc.categoryId === categoryId);
  const effectivePricingData = categoryPricingEntry?.pricing?.[0] ?? defaultPricingData;

  const defaultMode = effectivePricingData?.defaultMode || 'per_time';
  const currency = effectivePricingData?.currency || 'EUR';
  const isPerTime = defaultMode === 'per_time';
  const hasHourly = isPerTime && (effectivePricingData?.hour?.price != null);
  const hasDaily = isPerTime && (effectivePricingData?.day?.price != null);
  const hasGuest = defaultMode === 'per_guest' && (effectivePricingData?.guest?.price != null);

  const effectiveMinimHours = effectivePricingData?.hour?.min ?? minim_hours;
  const effectiveMinimDays = effectivePricingData?.day?.min ?? minim_days;
  const effectiveMinimGuests = effectivePricingData?.guest?.min ?? minim_guests;

  useEffect(() => {
    if (bookingType === 'hour' && !hasHourly) {
      setBookingType(hasDaily ? 'day' : 'guest');
    } else if (bookingType === 'day' && !hasDaily) {
      setBookingType(hasHourly ? 'hour' : 'guest');
    } else if (bookingType === 'guest' && !hasGuest) {
      setBookingType(hasHourly ? 'hour' : 'day');
    }
  }, [categoryId, effectivePricingData, bookingType, hasHourly, hasDaily, hasGuest]);

  useEffect(() => {
    if (checkInDate && startTime) {
      const [hours, minutes] = startTime.split(':');
      const checkInDateTime = new Date(checkInDate);
      checkInDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setValue('checkIn', checkInDateTime.toISOString());
    }
    if (checkOutDate && endTime) {
      const [hours, minutes] = endTime.split(':');
      const checkOutDateTime = new Date(checkOutDate);
      checkOutDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setValue('checkOut', checkOutDateTime.toISOString());
    }
  }, []);

  useEffect(() => {
    if (!checkInDate) return;
    
    if (isToday(checkInDate)) {
      const currentTimeRounded = getCurrentTimeRounded();
      setStartTime(currentTimeRounded);
      const newEndTime = addHoursToTime(currentTimeRounded, DEFAULT_END_TIME_OFFSET_HOURS);
      setEndTime(newEndTime);
    }
  }, [checkInDate]);

  useEffect(() => {
    if (!checkInDate || !checkOutDate) return;
    
    const checkInDateOnly = new Date(checkInDate);
    checkInDateOnly.setHours(0, 0, 0, 0);
    const checkOutDateOnly = new Date(checkOutDate);
    checkOutDateOnly.setHours(0, 0, 0, 0);

    if (checkOutDateOnly < checkInDateOnly) {
      const newCheckOutDate = new Date(checkInDate);
      newCheckOutDate.setDate(newCheckOutDate.getDate() + 1);
      newCheckOutDate.setHours(0, 0, 0, 0);
      setCheckOutDate(newCheckOutDate);
    }
  }, [checkInDate]);

  useEffect(() => {
    if (!checkInDate || !startTime) return;
    
    const [hours, minutes] = startTime.split(':');
    const checkInDateTime = new Date(checkInDate);
    checkInDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setValue('checkIn', checkInDateTime.toISOString());
  }, [checkInDate, startTime, setValue]);

  useEffect(() => {
    if (!checkOutDate || !endTime) return;
    
    const [hours, minutes] = endTime.split(':');
    const checkOutDateTime = new Date(checkOutDate);
    checkOutDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setValue('checkOut', checkOutDateTime.toISOString());
  }, [checkOutDate, endTime, setValue]);

  useEffect(() => {
    if (!checkInDate || !checkOutDate || !startTime || !endTime) return;
    
    if (isSameDay(checkInDate, checkOutDate)) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;

      if (endTotal <= startTotal) {
        let newMinutes = startMinutes + 15;
        let newHours = startHours;
        if (newMinutes >= 60) {
          newMinutes = 0;
          newHours = (newHours + 1) % 24;
        }
        const newEndTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        setEndTime(newEndTime);
      }
    }
  }, [startTime, checkInDate, checkOutDate]);

  const [options, setOptions] = useState<{ categories: SelectOption[] }>({
    categories: []
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading] = useState(false);

  useEffect(() => {
    if (locationId) {
      setValue('locationId', locationId);
    }
  }, [locationId, setValue]);

  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const startTimeParam = searchParams.get('startTime');
    const endTimeParam = searchParams.get('endTime');
    const guestsParam = searchParams.get('guests');
    const bookingTypeParam = searchParams.get('bookingType');
    const eventTypeParam = searchParams.get('eventType');

    if (checkInParam) {
      const date = new Date(checkInParam);
      if (!isNaN(date.getTime())) {
        setCheckInDate(date);
      }
    }
    if (checkOutParam) {
      const date = new Date(checkOutParam);
      if (!isNaN(date.getTime())) {
        setCheckOutDate(date);
      }
    }
    if (startTimeParam) {
      setStartTime(startTimeParam);
    }
    if (endTimeParam) {
      setEndTime(endTimeParam);
    }
    if (guestsParam) {
      const guestsNum = parseInt(guestsParam, 10);
      if (!isNaN(guestsNum)) {
        setValue('guests', guestsNum);
      }
    }
    if (bookingTypeParam && (bookingTypeParam === 'hour' || bookingTypeParam === 'day' || bookingTypeParam === 'guest')) {
      if (isPerTime && (bookingTypeParam === 'hour' || bookingTypeParam === 'day')) {
        if (bookingTypeParam === 'hour' && hasHourly) {
          setBookingType('hour');
        } else if (bookingTypeParam === 'day' && hasDaily) {
          setBookingType('day');
        }
      } else if (hasGuest && bookingTypeParam === 'guest') {
        setBookingType('guest');
      }
    }
    if (eventTypeParam) {
      const categoryIdNum = parseInt(eventTypeParam, 10);
      if (!isNaN(categoryIdNum) && categoryIdNum > 0) {
        setValue('categoryId', categoryIdNum);
      }
    }
  }, [searchParams, setValue, isPerTime, hasHourly, hasDaily, hasGuest]);

  useEffect(() => {
    if (bookingType) {
      const params = new URLSearchParams(searchParams);
      params.set('bookingType', bookingType);
      setSearchParams(params, { replace: true });
    }
  }, [bookingType, searchParams, setSearchParams]);

  useEffect(() => {
    if (watchedValues.categoryId && watchedValues.categoryId > 0) {
      const params = new URLSearchParams(searchParams);
      params.set('eventType', watchedValues.categoryId.toString());
      setSearchParams(params, { replace: true });
    }
  }, [watchedValues.categoryId, searchParams, setSearchParams]);

  useEffect(() => {
    if (checkInDate && checkOutDate && startTime && endTime) {
      try {
        const bookingDataToStore = {
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
          startTime,
          endTime,
          guests: watchedValues.guests || 0,
          bookingType,
          categoryId: watchedValues.categoryId || 0,
        };
        localStorage.setItem('booking-data', JSON.stringify(bookingDataToStore));
      } catch (error) {
        console.error('Error saving booking data to localStorage:', error);
      }
    }
  }, [checkInDate, checkOutDate, startTime, endTime, watchedValues.guests, bookingType, watchedValues.categoryId]);

  useEffect(() => {
    const currentUserData = getUserData(user);
    if (currentUserData.name) {
      setValue('customerName', currentUserData.name);
    }
    if (currentUserData.email) {
      setValue('customerEmail', currentUserData.email);
    }
    if (currentUserData.phone) {
      setValue('customerPhone', currentUserData.phone);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (bookingData.guests && bookingData.guests > 0) {
      setValue('guests', bookingData.guests);
    }
  }, []);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setOptions({
        categories: toSelectOptions(categories),
      });
    }
  }, [categories]);

  useEffect(() => {
    if (options.categories.length > 0) {
      const eventTypeParam = searchParams.get('eventType');
      if (eventTypeParam) {
        const categoryIdNum = parseInt(eventTypeParam, 10);
        if (!isNaN(categoryIdNum) && categoryIdNum > 0) {
          const categoryExists = options.categories.some(cat => cat.value === categoryIdNum);
          if (categoryExists) {
            setValue('categoryId', categoryIdNum);
          }
        }
      }
    }
  }, [options.categories, searchParams, setValue]);

  const prevValuesRef = useRef<string>('');
  
  useEffect(() => {
    if (onFormChange) {
      const selectedCategory = options.categories.find(cat => cat.value === watchedValues.categoryId);
      const currentData = {
        ...watchedValues,
        categoryName: selectedCategory?.label,
        bookingType,
      };
      const currentValuesString = JSON.stringify({
        checkIn: currentData.checkIn,
        checkOut: currentData.checkOut,
        guests: currentData.guests,
        categoryId: currentData.categoryId,
        categoryName: currentData.categoryName,
        bookingType: currentData.bookingType,
      });
      
      if (prevValuesRef.current !== currentValuesString) {
        prevValuesRef.current = currentValuesString;
        onFormChange(currentData);
      }
    }
  }, [watchedValues.checkIn, watchedValues.checkOut, watchedValues.guests, watchedValues.categoryId, options.categories, onFormChange, bookingType]);

  const getMinStartTime = (): string | undefined => {
    if (checkInDate && isToday(checkInDate)) {
      return getCurrentTimeRounded();
    }
    return undefined;
  };

  const getMinEndTime = (): string | undefined => {
    if (checkInDate && checkOutDate && isSameDay(checkInDate, checkOutDate) && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      let newMinutes = minutes + 15;
      let newHours = hours;
      if (newMinutes >= 60) {
        newMinutes = 0;
        newHours = (newHours + 1) % 24;
      }
      return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }
    return undefined;
  };

  const getCurrencySymbol = () => {
    if (currency === 'RON') return '';
    return '€';
  };

  const getPriceLabel = () => {
    if (!effectivePricingData) {
      return `From €${pricePerDay} / day`;
    }

    const currencySymbol = getCurrencySymbol();
    const currencyText = currency === 'RON' ? ' RON' : '';

    if (bookingType === 'hour' && effectivePricingData.hour?.price != null) {
      return `From ${currencySymbol}${effectivePricingData.hour.price}${currencyText} / hour`;
    }
    
    if (bookingType === 'day' && effectivePricingData.day?.price != null) {
      return `From ${currencySymbol}${effectivePricingData.day.price}${currencyText} / day`;
    }
    
    if (bookingType === 'guest' && effectivePricingData.guest?.price != null) {
      return `From ${currencySymbol}${effectivePricingData.guest.price}${currencyText} / guest`;
    }

    return '';
  };

  const onSubmit = async (data: FormValues) => {
    if (!isCheckout) {
      const params = new URLSearchParams();
      if (checkInDate) params.set('checkIn', checkInDate.toISOString());
      if (checkOutDate) params.set('checkOut', checkOutDate.toISOString());
      if (startTime) params.set('startTime', startTime);
      if (endTime) params.set('endTime', endTime);
      if (data.guests) params.set('guests', data.guests.toString());
      if (bookingType) params.set('bookingType', bookingType);
      if (data.categoryId && data.categoryId > 0) params.set('eventType', data.categoryId.toString());
      params.set('step', '1');

      const queryString = params.toString();
      navigate(`/checkout/${slug}${queryString ? `?${queryString}` : ''}`);
      return;
    }

    if (!checkInDate || !checkOutDate || !startTime || !endTime) {
      setFeedback({ type: 'error', message: 'Please select dates and times' });
      return;
    }

    try {
      setFeedback(null);

      const [startHours, startMinutes] = startTime.split(':');
      const [endHours, endMinutes] = endTime.split(':');

      const checkInDateTime = new Date(checkInDate);
      checkInDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const checkOutDateTime = new Date(checkOutDate);
      checkOutDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      if (checkOutDateTime <= checkInDateTime) {
        setFeedback({ type: 'error', message: 'Check-out must be after check-in' });
        return;
      }

      const body = {
        categoryId: data.categoryId,
        locationId: data.locationId,
        guests: data.guests,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        checkIn: checkInDateTime.toISOString(),
        checkOut: checkOutDateTime.toISOString(),
      };

      const { status, response } = await checkoutBooking(body);

      if (status === 200) {
        console.log(response);
        const bookingId = response?.data?.id;
        const bookingCode = response?.data?.bookingCode;

        if(bookingId && bookingCode) {
          navigate(`/checkout/successful/${bookingId}/${bookingCode}`);
        } else {
          setFeedback({ type: 'error', message: response?.message || 'Failed to confirm reservation' });
        }
      }
    } catch (error: any) {
      console.error('Error confirming reservation:', error);
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'An error occurred. Please try again.'
      });
    }
  };

  return (
    <div className={`w-full ${isCheckout ? 'p-6' : 'p-6 border border-gray-200 rounded-sm bg-white sticky '}`}>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="categoryId"
          control={control}
          rules={{
            required: 'Event type is required',
            validate: (v) => (v && Number(v) > 0) || 'Event type is required'
          }}
          render={({ field }) => (
            <CustomSelect
              label="EVENT TYPE"
              options={options.categories}
              value={options.categories.filter((o) => field.value === o.value)}
              onChange={(option: any) => field.onChange(option?.value ?? 0)}
              required
              error={errors.categoryId?.message}
              placeholder="Select event type"
            />
          )}
        />

        {effectivePricingData && (
          <div>
            <label className="block text-sm font-medium  mb-2">
              PRICING
            </label>
            <div className="space-y-2">
              {isPerTime && hasHourly && (
                <CustomRadioButton
                  name="bookingType"
                  value="hour"
                  checked={bookingType === 'hour'}
                  onChange={setBookingType}
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span>Hourly</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {getCurrencySymbol()}{effectivePricingData.hour?.price}{currency === 'RON' ? ' RON' : ''} / hour
                      </span>
                    </div>
                  }
                />
              )}
              {isPerTime && hasDaily && (
                <CustomRadioButton
                  name="bookingType"
                  value="day"
                  checked={bookingType === 'day'}
                  onChange={setBookingType}
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span>Daily</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {getCurrencySymbol()}{effectivePricingData.day?.price}{currency === 'RON' ? ' RON' : ''} / day
                      </span>
                    </div>
                  }
                />
              )}
              {hasGuest && (
                <CustomRadioButton
                  name="bookingType"
                  value="guest"
                  checked={bookingType === 'guest'}
                  onChange={setBookingType}
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span>Per Guest</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {getCurrencySymbol()}{effectivePricingData.guest?.price}{currency === 'RON' ? ' RON' : ''} / guest
                      </span>
                    </div>
                  }
                />
              )}
            </div>
          </div>
        )}
        {isCheckout && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="customerName"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <CustomInput
                    label="NAME"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type name"
                    required
                    error={errors.customerName?.message}
                  />
                )}
              />
              <Controller
                name="customerPhone"
                control={control}
                rules={{
                  required: 'Phone is required',
                  pattern: {
                    value: /^[0-9+\- ]+$/,
                    message: 'Invalid phone number format'
                  }
                }}
                render={({ field }) => (
                  <CustomInput
                    label="Phone"
                    type="tel"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type Phone"
                    required
                    error={errors.customerPhone?.message}
                  />
                )}
              />
            </div>
            <Controller
              name="customerEmail"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <CustomInput
                  label="EMAIL"
                  type="email"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type Email"
                  required
                  error={errors.customerEmail?.message}
                />
              )}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <CustomDatePicker
              label="CHECK-IN"
              selected={checkInDate}
              onChange={(date) => {
                setCheckInDate(date);
              }}
              placeholder="Select date"
              iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
              minDate={new Date()}
              showTimeSelect={false}
              dateFormat="dd/MM/yyyy"
              required
            />
            {errors.checkIn && (
              <p className="text-sm text-red-500 mt-1">{errors.checkIn.message}</p>
            )}
          </div>
          <div>
            <CustomDatePicker
              label="CHECK-OUT"
              selected={checkOutDate}
              onChange={(date) => {
                setCheckOutDate(date);
              }}
              placeholder="Select date"
              iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
              minDate={checkInDate || new Date()}
              showTimeSelect={false}
              dateFormat="dd/MM/yyyy"
              required
            />
            {errors.checkOut && (
              <p className="text-sm text-red-500 mt-1">{errors.checkOut.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CustomTimePicker
            label="START TIME"
            value={startTime}
            onChange={(value) => {
              setStartTime(value);
            }}
            iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
            required
            minTime={getMinStartTime()}
          />
          <CustomTimePicker
            label="END TIME"
            value={endTime}
            onChange={(value) => {
              setEndTime(value);
            }}
            iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
            required
            minTime={getMinEndTime()}
          />
        </div>


        <Controller
          name="guests"
          control={control}
          rules={{
            required: 'Number of guests is required',
            min: { value: 1, message: 'At least 1 guest is required' },
            max: { value: maxGuests, message: `Maximum ${maxGuests} guests allowed` }
          }}
          render={({ field }) => (
            <CustomInput
              label="GUESTS"
              type="number"
              value={field.value || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  field.onChange('');
                } else {
                  const numValue = Number(value);
                  if (!isNaN(numValue) && numValue >= 0) {
                    field.onChange(numValue);
                  }
                }
              }}
              placeholder={`Max ${maxGuests} guests`}
              required
              error={errors.guests?.message}
            />
          )}
        />

        {((bookingType === 'hour' || bookingType === 'day') && effectiveMinimHours) || (bookingType === 'guest' && effectiveMinimGuests) ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            {(bookingType === 'hour' || bookingType === 'day') && effectiveMinimHours && (
              <p className="text-sm text-blue-700">
                Trebuie să rezervi minim {effectiveMinimHours} {effectiveMinimHours === 1 ? 'oră' : 'ore'} locația
              </p>
            )}
            {bookingType === 'guest' && effectiveMinimGuests && (
              <p className="text-sm text-blue-700">
                Trebuie să rezervi minim {effectiveMinimGuests} {effectiveMinimGuests === 1 ? 'oaspete' : 'oaspeți'}
              </p>
            )}
          </div>
        ) : null}

        {feedback && (
          <div
            className={`text-sm font-medium px-3 py-2 rounded-lg ${feedback.type === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
          >
            {feedback.message}
          </div>
        )}

        {isCheckout && !userData?.email &&
          <Controller
            name="createAccount"
            control={control}
            render={({ field }) => (
              <CustomCheckbox
                label="Create an account after reservation is completed to enjoy all the benefits, if you have one already, the account will be linked."
                checked={true}
                onChange={field.onChange}
              />
            )}
          />

        }
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`w-full font-medium py-3 px-4 rounded-xl transition disabled:opacity-50 bg-primary text-white`}
        >
          {isSubmitting ? 'Processing...' : (viewMode === 'checkout' ? 'Confirma' : 'Reserve now')}
        </button>

        <p className="text-xs text-center text-gray-500 mt-2">
          Free reservation – no payment or hidden fees
        </p>
      </form>
    </div>
  );
};

export default ReservationRight;
