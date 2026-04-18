import React from 'react'
import { Controller } from 'react-hook-form'
import { Calendar, Clock } from 'lucide-react'
import CustomSelect from '../components/shared/CustomSelect'
import CustomRadioButton from '../components/shared/CustomRadioButton'
import CustomDatePicker from '../components/shared/CustomDatePicker'
import CustomTimePicker from '../components/shared/CustomTimePicker'
import CustomInput from '../components/shared/CustomInput'

type SelectOption = { value: string | number; label: string }

type CheckoutEventDetailsProps = {
  control: any
  errors: any
  options: { categories: SelectOption[] }

  effectivePricingData: any
  currency: string
  currencySymbol: string
  isPerTime: boolean
  hasHourly: boolean
  hasDaily: boolean
  hasGuest: boolean

  bookingType: string
  setBookingType: (value: string) => void

  checkInDate: Date | null
  checkOutDate: Date | null
  startTime: string
  endTime: string
  setCheckInDate: (date: Date | null) => void
  setCheckOutDate: (date: Date | null) => void
  setStartTime: (value: string) => void
  setEndTime: (value: string) => void

  minStartTime?: string
  minEndTime?: string

  maxGuests: number

  effectiveMinimHours: number | null
  effectiveMinimGuests: number | null

  onContinue: () => void
  canContinue: boolean
}

const CheckoutEventDetails: React.FC<CheckoutEventDetailsProps> = ({
  control,
  errors,
  options,

  effectivePricingData,
  currency,
  currencySymbol,
  isPerTime,
  hasHourly,
  hasDaily,
  hasGuest,

  bookingType,
  setBookingType,

  checkInDate,
  checkOutDate,
  startTime,
  endTime,
  setCheckInDate,
  setCheckOutDate,
  setStartTime,
  setEndTime,

  minStartTime,
  minEndTime,

  maxGuests,

  effectiveMinimHours,
  effectiveMinimGuests,

  onContinue,
  canContinue,
}) => {
  return (
    <>
      <Controller
        name="categoryId"
        control={control}
        rules={{
          required: 'Event type is required',
          validate: (v: number) => (v && Number(v) > 0) || 'Event type is required',
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
          <label className="block text-sm font-medium  mb-2">PRICING</label>
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
                      {currencySymbol}
                      {effectivePricingData.hour?.price}
                      {currency === 'RON' ? ' RON' : ''} / hour
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
                      {currencySymbol}
                      {effectivePricingData.day?.price}
                      {currency === 'RON' ? ' RON' : ''} / day
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
                      {currencySymbol}
                      {effectivePricingData.guest?.price}
                      {currency === 'RON' ? ' RON' : ''} / guest
                    </span>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <CustomDatePicker
            label="CHECK-IN"
            selected={checkInDate}
            onChange={(date) => {
              setCheckInDate(date)
            }}
            placeholder="Select date"
            iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
            minDate={new Date()}
            showTimeSelect={false}
            dateFormat="dd/MM/yyyy"
            required
          />
          {errors.checkIn && <p className="text-sm text-red-500 mt-1">{errors.checkIn.message}</p>}
        </div>

        <div>
          <CustomDatePicker
            label="CHECK-OUT"
            selected={checkOutDate}
            onChange={(date) => {
              setCheckOutDate(date)
            }}
            placeholder="Select date"
            iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
            minDate={checkInDate || new Date()}
            showTimeSelect={false}
            dateFormat="dd/MM/yyyy"
            required
          />
          {errors.checkOut && <p className="text-sm text-red-500 mt-1">{errors.checkOut.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CustomTimePicker
          label="START TIME"
          value={startTime}
          onChange={(value) => {
            setStartTime(value)
          }}
          iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
          required
          minTime={minStartTime}
        />

        <CustomTimePicker
          label="END TIME"
          value={endTime}
          onChange={(value) => {
            setEndTime(value)
          }}
          iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
          required
          minTime={minEndTime}
        />
      </div>

      <Controller
        name="guests"
        control={control}
        rules={{
          required: 'Number of guests is required',
          min: { value: 1, message: 'At least 1 guest is required' },
          max: { value: maxGuests, message: `Maximum ${maxGuests} guests allowed` },
        }}
        render={({ field }) => (
          <CustomInput
            label="GUESTS"
            type="number"
            value={field.value || ''}
            onChange={(e) => {
              const value = e.target.value
              if (value === '') {
                field.onChange('')
              } else {
                const numValue = Number(value)
                if (!isNaN(numValue) && numValue >= 0) {
                  field.onChange(numValue)
                }
              }
            }}
            placeholder={`Max ${maxGuests} guests`}
            required
            error={errors.guests?.message}
          />
        )}
      />

      {((bookingType === 'hour' || bookingType === 'day') && effectiveMinimHours) ||
      (bookingType === 'guest' && effectiveMinimGuests) ? (
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

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className={`w-full font-medium py-3 px-4 rounded-xl transition disabled:opacity-50 bg-primary text-white`}
      >
        Continua
      </button>
    </>
  )
}

export default CheckoutEventDetails