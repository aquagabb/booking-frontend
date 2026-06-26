import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import CheckoutSummary from './CheckoutSummary'
import CheckoutContact from './CheckoutContact'
import CheckoutEventDetails from './CheckoutEventDetails'
import CheckoutSidebar from './CheckoutSidebar'
import { getLocationBySlug } from '../../api/locations/locations'
import { checkoutBooking } from '../../api/bookings/bookings'
import { toSelectOptions } from '../../lib/utils'
import { useUserStore } from '../../store/user.store'

type PricingItem = {
  currency: string
  defaultMode: 'per_time' | 'per_guest'
  hour?: {
    price: number
    min?: number
  }
  day?: {
    price: number
    min?: number
  }
  guest?: {
    price: number
    min?: number
  }
}

type PricingCategory = {
  id: number
  categoryId: number
  pricing: PricingItem[]
}

type Category = {
  id: number
  name: string
}

type Location = {
  id: number
  name: string
  address: string
  rating?: string | number
  ratingCount?: number
  googleMapsUrl?: string
  photos?: Array<any>
  maxGuests?: number
  pricing?: PricingItem[]
  approvalDays?: number
  pricingCategories?: PricingCategory[]
  categories?: Category[]
}

type CheckoutPricingMode = 'per_time_hour' | 'per_time_day' | 'per_guest'

type FormValues = {
  categoryId: number
  locationId: number
  guests: number
  customerName: string
  customerEmail: string
  customerPhone: string
  checkIn: string
  checkOut: string
  createAccount: boolean
  /** Observații suplimentare / cereri speciale (pasul final checkout) */
  additionalInfo: string
}

type SelectOption = { value: string | number; label: string }

function bookingTypeToPricing(bookingType: string): CheckoutPricingMode {
  if (bookingType === 'day') return 'per_time_day'
  if (bookingType === 'guest') return 'per_guest'
  return 'per_time_hour'
}

const CheckoutInner: React.FC<{ location: Location; restaurantSlug: string }> = ({
  location,
  restaurantSlug,
}) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useUserStore((state) => state.user)

  const isCheckout = true
  const locationId = location.id
  const categories = location.categories ?? []
  const pricing = location.pricing ?? []
  const pricingCategories = location.pricingCategories ?? []
  const maxGuests = location.maxGuests ?? 50
  const minim_hours: number | null = null
  const minim_guests: number | null = null
  const pricePerDay = 60

  const defaultPricingData = pricing && pricing.length > 0 ? pricing[0] : null

  const getBookingData = () => {
    const bookingData: {
      checkIn?: string
      checkOut?: string
      startTime?: string
      endTime?: string
      guests?: number
      bookingType?: string
      categoryId?: number
    } = {}

    const checkInParam = searchParams.get('checkIn')
    const checkOutParam = searchParams.get('checkOut')
    const startTimeParam = searchParams.get('startTime')
    const endTimeParam = searchParams.get('endTime')
    const guestsParam = searchParams.get('guests')
    const bookingTypeParam = searchParams.get('bookingType')
    const eventTypeParam = searchParams.get('eventType')

    let storedData: any = null
    try {
      const stored = localStorage.getItem('booking-data')
      if (stored) {
        storedData = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error reading booking data from localStorage:', error)
    }

    bookingData.checkIn = checkInParam || storedData?.checkIn
    bookingData.checkOut = checkOutParam || storedData?.checkOut
    bookingData.startTime = startTimeParam || storedData?.startTime
    bookingData.endTime = endTimeParam || storedData?.endTime
    bookingData.bookingType = bookingTypeParam || storedData?.bookingType

    if (eventTypeParam) {
      const categoryIdNum = parseInt(eventTypeParam, 10)
      if (!isNaN(categoryIdNum)) {
        bookingData.categoryId = categoryIdNum
      }
    } else if (storedData?.categoryId) {
      bookingData.categoryId = storedData.categoryId
    }

    if (guestsParam) {
      const guestsNum = parseInt(guestsParam, 10)
      if (!isNaN(guestsNum)) {
        bookingData.guests = guestsNum
      }
    } else if (storedData?.guests) {
      bookingData.guests = storedData.guests
    }

    return bookingData
  }

  const bookingData = getBookingData()

  const getCurrentTimeRounded = (): string => {
    const now = new Date()
    let hours = now.getHours()
    let minutes = now.getMinutes()

    const remainder = minutes % 15
    if (remainder !== 0) {
      minutes = minutes + (15 - remainder)
      if (minutes >= 60) {
        minutes = 0
        hours = (hours + 1) % 24
      }
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const isToday = (date: Date | null): boolean => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const addHoursToTime = (time: string, hoursToAdd: number): string => {
    const [hours, minutes] = time.split(':').map(Number)
    let newHours = hours + hoursToAdd
    if (newHours >= 24) {
      newHours = newHours % 24
    }
    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()
  }

  const getInitialCheckIn = (): Date => {
    const now = new Date()
    const todayDate = new Date(now)
    todayDate.setHours(0, 0, 0, 0)

    // startDate / endDate nu sunt folosite în checkout-ul curent; păstrăm logica din ReservationRight.
    const startDate: string | undefined = undefined
    if (startDate) {
      const date = new Date(startDate)
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date
      }
    }

    if (bookingData.checkIn) {
      const date = new Date(bookingData.checkIn)
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  const getInitialCheckOut = (): Date => {
    const now = new Date()
    const todayDate = new Date(now)
    todayDate.setHours(0, 0, 0, 0)

    const endDate: string | undefined = undefined
    if (endDate) {
      const date = new Date(endDate)
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date
      }
    }

    if (bookingData.checkOut) {
      const date = new Date(bookingData.checkOut)
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)
      if (!isNaN(date.getTime()) && dateOnly >= todayDate) {
        return date
      }
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }

  const getInitialBookingType = (): string => {
    const initialCatId = bookingData?.categoryId ?? 0
    const initialEntry = pricingCategories?.find((pc) => pc.categoryId === initialCatId)
    const initialPricing = initialEntry?.pricing?.[0] ?? defaultPricingData
    const mode = initialPricing?.defaultMode || 'per_time'
    const isPerTimeInit = mode === 'per_time'
    const hasHourlyInit = isPerTimeInit && initialPricing?.hour?.price != null
    const hasDailyInit = isPerTimeInit && initialPricing?.day?.price != null
    const hasGuestInit = mode === 'per_guest' && initialPricing?.guest?.price != null

    if (bookingData.bookingType) {
      if (isPerTimeInit && (bookingData.bookingType === 'hour' || bookingData.bookingType === 'day')) {
        if (bookingData.bookingType === 'hour' && hasHourlyInit) return 'hour'
        if (bookingData.bookingType === 'day' && hasDailyInit) return 'day'
      }
      if (hasGuestInit && bookingData.bookingType === 'guest') return 'guest'
    }

    if (isPerTimeInit) return hasHourlyInit ? 'hour' : 'day'
    return 'guest'
  }

  const DEFAULT_END_TIME_OFFSET_HOURS = 1

  const getInitialStartTime = (): string => {
    const initialCheckIn = getInitialCheckIn()
    if (isToday(initialCheckIn)) {
      return getCurrentTimeRounded()
    }
    return bookingData.startTime || '22:00'
  }

  const getInitialEndTime = (startTimeValue: string): string => {
    if (bookingData.endTime) {
      return bookingData.endTime
    }
    const [hours, minutes] = startTimeValue.split(':').map(Number)
    let newHours = hours + DEFAULT_END_TIME_OFFSET_HOURS
    if (newHours >= 24) {
      newHours = newHours % 24
    }
    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const [bookingType, setBookingType] = useState<string>(getInitialBookingType)
  const [checkInDate, setCheckInDate] = useState<Date | null>(getInitialCheckIn())
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(getInitialCheckOut())
  const initialStartTime = getInitialStartTime()
  const [startTime, setStartTime] = useState<string>(initialStartTime)
  const [endTime, setEndTime] = useState<string>(getInitialEndTime(initialStartTime))

  const getUserData = (currentUser: typeof user) => {
    try {
      const userStorage = localStorage.getItem('user-storage')
      if (userStorage) {
        const parsed = JSON.parse(userStorage)
        const userData = parsed?.state?.user
        if (userData) {
          return {
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          }
        }
      }
    } catch (error) {
      console.error('Error reading user data from localStorage:', error)
    }
    return {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: (currentUser as any)?.phone || '',
    }
  }

  const userData = getUserData(user)

  const {
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    clearErrors,
  } = useForm<FormValues>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      categoryId: (bookingData.categoryId as number) || 0,
      locationId: locationId || 0,
      guests: (bookingData.guests as number) || 0,
      customerName: userData.name || '',
      customerEmail: userData.email || '',
      customerPhone: userData.phone || '',
      checkIn: '',
      checkOut: '',
      createAccount: true,
      additionalInfo: '',
    },
  })

  const watchedValues = watch()
  const categoryId = watchedValues?.categoryId ?? bookingData?.categoryId ?? 0
  const categoryPricingEntry = pricingCategories?.find((pc) => pc.categoryId === categoryId)
  const effectivePricingData = categoryPricingEntry?.pricing?.[0] ?? defaultPricingData

  const defaultMode = effectivePricingData?.defaultMode || 'per_time'
  const currency = effectivePricingData?.currency || 'EUR'
  const isPerTime = defaultMode === 'per_time'
  const hasHourly = isPerTime && effectivePricingData?.hour?.price != null
  const hasDaily = isPerTime && effectivePricingData?.day?.price != null
  const hasGuest = defaultMode === 'per_guest' && effectivePricingData?.guest?.price != null

  const effectiveMinimHours = effectivePricingData?.hour?.min ?? minim_hours
  const effectiveMinimGuests = effectivePricingData?.guest?.min ?? minim_guests

  const [options, setOptions] = useState<{ categories: SelectOption[] }>({ categories: [] })
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isLoading] = useState(false)

  useEffect(() => {
    if (locationId) {
      setValue('locationId', locationId)
    }
  }, [locationId, setValue])

  useEffect(() => {
    if (bookingType === 'hour' && !hasHourly) {
      setBookingType(hasDaily ? 'day' : 'guest')
    } else if (bookingType === 'day' && !hasDaily) {
      setBookingType(hasHourly ? 'hour' : 'guest')
    } else if (bookingType === 'guest' && !hasGuest) {
      setBookingType(hasHourly ? 'hour' : 'day')
    }
  }, [categoryId, effectivePricingData, bookingType, hasHourly, hasDaily, hasGuest])

  useEffect(() => {
    if (checkInDate && startTime) {
      const [hours, minutes] = startTime.split(':')
      const checkInDateTime = new Date(checkInDate)
      checkInDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      setValue('checkIn', checkInDateTime.toISOString())
    }
    if (checkOutDate && endTime) {
      const [hours, minutes] = endTime.split(':')
      const checkOutDateTime = new Date(checkOutDate)
      checkOutDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      setValue('checkOut', checkOutDateTime.toISOString())
    }
    // Intentional: identic cu ReservationRight (rule-of-hooks + efect on-mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!checkInDate) return

    if (isToday(checkInDate)) {
      const currentTimeRounded = getCurrentTimeRounded()
      setStartTime(currentTimeRounded)
      const newEndTime = addHoursToTime(currentTimeRounded, DEFAULT_END_TIME_OFFSET_HOURS)
      setEndTime(newEndTime)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInDate])

  useEffect(() => {
    if (!checkInDate || !checkOutDate) return

    const checkInDateOnly = new Date(checkInDate)
    checkInDateOnly.setHours(0, 0, 0, 0)
    const checkOutDateOnly = new Date(checkOutDate)
    checkOutDateOnly.setHours(0, 0, 0, 0)

    if (checkOutDateOnly < checkInDateOnly) {
      const newCheckOutDate = new Date(checkInDate)
      newCheckOutDate.setDate(newCheckOutDate.getDate() + 1)
      newCheckOutDate.setHours(0, 0, 0, 0)
      setCheckOutDate(newCheckOutDate)
    }
  }, [checkInDate])

  useEffect(() => {
    if (!checkInDate || !startTime) return

    const [hours, minutes] = startTime.split(':')
    const checkInDateTime = new Date(checkInDate)
    checkInDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    setValue('checkIn', checkInDateTime.toISOString())
  }, [checkInDate, startTime, setValue])

  useEffect(() => {
    if (!checkOutDate || !endTime) return

    const [hours, minutes] = endTime.split(':')
    const checkOutDateTime = new Date(checkOutDate)
    checkOutDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    setValue('checkOut', checkOutDateTime.toISOString())
  }, [checkOutDate, endTime, setValue])

  useEffect(() => {
    if (!checkInDate || !checkOutDate || !startTime || !endTime) return

    if (isSameDay(checkInDate, checkOutDate)) {
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      const [endHours, endMinutes] = endTime.split(':').map(Number)

      const startTotal = startHours * 60 + startMinutes
      const endTotal = endHours * 60 + endMinutes

      if (endTotal <= startTotal) {
        let newMinutes = startMinutes + 15
        let newHours = startHours
        if (newMinutes >= 60) {
          newMinutes = 0
          newHours = (newHours + 1) % 24
        }
        const newEndTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
        setEndTime(newEndTime)
      }
    }
  }, [startTime, checkInDate, checkOutDate])

  useEffect(() => {
    const checkInParam = searchParams.get('checkIn')
    const checkOutParam = searchParams.get('checkOut')
    const startTimeParam = searchParams.get('startTime')
    const endTimeParam = searchParams.get('endTime')
    const guestsParam = searchParams.get('guests')
    const bookingTypeParam = searchParams.get('bookingType')
    const eventTypeParam = searchParams.get('eventType')

    if (checkInParam) {
      const date = new Date(checkInParam)
      if (!isNaN(date.getTime())) {
        setCheckInDate(date)
      }
    }

    if (checkOutParam) {
      const date = new Date(checkOutParam)
      if (!isNaN(date.getTime())) {
        setCheckOutDate(date)
      }
    }

    if (startTimeParam) {
      setStartTime(startTimeParam)
    }

    if (endTimeParam) {
      setEndTime(endTimeParam)
    }

    if (guestsParam) {
      const guestsNum = parseInt(guestsParam, 10)
      if (!isNaN(guestsNum)) {
        setValue('guests', guestsNum)
      }
    }

    if (bookingTypeParam && (bookingTypeParam === 'hour' || bookingTypeParam === 'day' || bookingTypeParam === 'guest')) {
      if (isPerTime && (bookingTypeParam === 'hour' || bookingTypeParam === 'day')) {
        if (bookingTypeParam === 'hour' && hasHourly) {
          setBookingType('hour')
        } else if (bookingTypeParam === 'day' && hasDaily) {
          setBookingType('day')
        }
      } else if (hasGuest && bookingTypeParam === 'guest') {
        setBookingType('guest')
      }
    }

    if (eventTypeParam) {
      const categoryIdNum = parseInt(eventTypeParam, 10)
      if (!isNaN(categoryIdNum) && categoryIdNum > 0) {
        setValue('categoryId', categoryIdNum)
      }
    }
  }, [searchParams, setValue, isPerTime, hasHourly, hasDaily, hasGuest])

  useEffect(() => {
    if (searchParams.get('step') == null || searchParams.get('step') === '') {
      const params = new URLSearchParams(searchParams)
      params.set('step', '1')
      setSearchParams(params, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (bookingType) {
      const params = new URLSearchParams(searchParams)
      params.set('bookingType', bookingType)
      setSearchParams(params, { replace: true })
    }
  }, [bookingType, searchParams, setSearchParams])

  useEffect(() => {
    if (watchedValues.categoryId && watchedValues.categoryId > 0) {
      const params = new URLSearchParams(searchParams)
      params.set('eventType', watchedValues.categoryId.toString())
      setSearchParams(params, { replace: true })
    }
  }, [watchedValues.categoryId, searchParams, setSearchParams])

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
        }
        localStorage.setItem('booking-data', JSON.stringify(bookingDataToStore))
      } catch (error) {
        console.error('Error saving booking data to localStorage:', error)
      }
    }
  }, [checkInDate, checkOutDate, startTime, endTime, watchedValues.guests, bookingType, watchedValues.categoryId])

  useEffect(() => {
    const currentUserData = getUserData(user)
    setValue('customerName', currentUserData.name || '', { shouldValidate: false })
    setValue('customerEmail', currentUserData.email || '', { shouldValidate: false })
    setValue('customerPhone', currentUserData.phone || '', { shouldValidate: false })
    clearErrors(['customerName', 'customerEmail', 'customerPhone'])
  }, [user, setValue, clearErrors])

  useEffect(() => {
    if (bookingData.guests && bookingData.guests > 0) {
      setValue('guests', bookingData.guests as number)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (categories && categories.length > 0) {
      setOptions({
        categories: toSelectOptions(categories),
      })
    }
  }, [categories])

  useEffect(() => {
    if (options.categories.length > 0) {
      const eventTypeParam = searchParams.get('eventType')
      if (eventTypeParam) {
        const categoryIdNum = parseInt(eventTypeParam, 10)
        if (!isNaN(categoryIdNum) && categoryIdNum > 0) {
          const categoryExists = options.categories.some((cat) => cat.value === categoryIdNum)
          if (categoryExists) {
            setValue('categoryId', categoryIdNum)
          }
        }
      }
    }
  }, [options.categories, searchParams, setValue])

  const prevValuesRef = useRef<string>('')
  const [bookingSummaryData, setBookingSummaryData] = useState<any>({})

  useEffect(() => {
    const selectedCategory = options.categories.find((cat) => cat.value === watchedValues.categoryId)
    const currentData = {
      ...watchedValues,
      categoryName: selectedCategory?.label,
      bookingType,
    }

    const currentValuesString = JSON.stringify({
      checkIn: currentData.checkIn,
      checkOut: currentData.checkOut,
      guests: currentData.guests,
      categoryId: currentData.categoryId,
      categoryName: currentData.categoryName,
      bookingType: currentData.bookingType,
    })

    if (prevValuesRef.current !== currentValuesString) {
      prevValuesRef.current = currentValuesString
      setBookingSummaryData(currentData)
    }
  }, [watchedValues.checkIn, watchedValues.checkOut, watchedValues.guests, watchedValues.categoryId, options.categories, bookingType])

  const getMinStartTime = (): string | undefined => {
    if (checkInDate && isToday(checkInDate)) {
      return getCurrentTimeRounded()
    }
    return undefined
  }

  const getMinEndTime = (): string | undefined => {
    if (checkInDate && checkOutDate && isSameDay(checkInDate, checkOutDate) && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number)
      let newMinutes = minutes + 15
      let newHours = hours
      if (newMinutes >= 60) {
        newMinutes = 0
        newHours = (newHours + 1) % 24
      }
      return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
    }
    return undefined
  }

  const getCurrencySymbol = () => {
    if (currency === 'RON') return ''
    return '€'
  }

  const onSubmit = async (data: FormValues) => {
    if (!checkInDate || !checkOutDate || !startTime || !endTime) {
      setFeedback({ type: 'error', message: 'Please select dates and times' })
      return
    }

    try {
      setFeedback(null)

      const [startHours, startMinutes] = startTime.split(':')
      const [endHours, endMinutes] = endTime.split(':')

      const checkInDateTime = new Date(checkInDate)
      checkInDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

      const checkOutDateTime = new Date(checkOutDate)
      checkOutDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

      if (checkOutDateTime <= checkInDateTime) {
        setFeedback({ type: 'error', message: 'Check-out must be after check-in' })
        return
      }

      const trimmedInfo = String(data.additionalInfo ?? '').trim()
      const body = {
        categoryId: data.categoryId,
        locationId: data.locationId,
        guests: data.guests,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        checkIn: checkInDateTime.toISOString(),
        checkOut: checkOutDateTime.toISOString(),
        pricing: bookingTypeToPricing(bookingType),
        ...(trimmedInfo ? { additionalInfo: trimmedInfo } : {}),
      }

      const { status, response } = await checkoutBooking(body)

      if (status === 200) {
        const bookingId = response?.data?.id
        const bookingCode = response?.data?.bookingCode

        if (bookingId && bookingCode) {
          navigate(`/checkout/successful/${bookingId}/${bookingCode}`)
        } else {
          setFeedback({ type: 'error', message: response?.message || 'Failed to confirm reservation' })
        }
      }
    } catch (error: any) {
      console.error('Error confirming reservation:', error)
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'An error occurred. Please try again.',
      })
    }
  }

  const minStartTime = getMinStartTime()
  const minEndTime = getMinEndTime()

  const showCreateAccount = isCheckout && !userData?.email

  const stepParam = searchParams.get('step')
  const step: 1 | 2 | 3 = stepParam === '2' ? 2 : stepParam === '3' ? 3 : 1

  /** Pasul curent vine din `?step=1|2|3` — păstrat la refresh, login redirect, share link. */
  const goToStep = (next: 1 | 2 | 3, replaceHistory = false) => {
    const params = new URLSearchParams(searchParams)
    params.set('step', String(next))
    setSearchParams(params, { replace: replaceHistory })
  }

  const breadcrumbs = [
    { label: 'Despre eveniment', step: 1 },
    { label: 'Date de contact', step: 2 },
    { label: 'Vizualizare rezervare', step: 3 },
  ]

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: 'Selecteaza ora si data evenimentului',
    2: 'Adauga detalii personale pentru a putea fi contactat',
    3: 'Verifica datele si confirma rezervarea',
  }

  const isStep1DateOrderValid = (): boolean => {
    if (!checkInDate || !checkOutDate || !startTime || !endTime) return false

    const [startHours, startMinutes] = startTime.split(':')
    const [endHours, endMinutes] = endTime.split(':')

    const checkInDateTime = new Date(checkInDate)
    checkInDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

    const checkOutDateTime = new Date(checkOutDate)
    checkOutDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

    return checkOutDateTime > checkInDateTime
  }

  const canContinueStep1 =
    categoryId > 0 &&
    (watchedValues.guests ?? 0) >= 1 &&
    Boolean(checkInDate && checkOutDate && startTime && endTime) &&
    isStep1DateOrderValid()

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  const phoneRegex = /^[0-9+\- ]+$/

  const canContinueStep2 =
    Boolean(String(watchedValues.customerName ?? '').trim()) &&
    phoneRegex.test(String(watchedValues.customerPhone ?? '')) &&
    emailRegex.test(String(watchedValues.customerEmail ?? ''))

  const handleContinueToContact = async () => {
    setFeedback(null)

    const okCategory = await trigger('categoryId')
    const okGuests = await trigger('guests')

    if (!okCategory || !okGuests) {
      setFeedback({ type: 'error', message: 'Please complete the event details' })
      return
    }

    if (!isStep1DateOrderValid()) {
      setFeedback({ type: 'error', message: 'Check-out must be after check-in' })
      return
    }

    if (!canContinueStep1) {
      setFeedback({ type: 'error', message: 'Please complete the event details' })
      return
    }

    // Sync event details into URL so step 1 can be restored from the query string.
    const params = new URLSearchParams(searchParams)
    if (checkInDate) params.set('checkIn', checkInDate.toISOString())
    if (checkOutDate) params.set('checkOut', checkOutDate.toISOString())
    if (startTime) params.set('startTime', startTime)
    if (endTime) params.set('endTime', endTime)
    if (watchedValues.guests != null) params.set('guests', String(watchedValues.guests))
    if (bookingType) params.set('bookingType', bookingType)
    if (watchedValues.categoryId) params.set('eventType', String(watchedValues.categoryId))
    params.set('step', '2')
    setSearchParams(params, { replace: true })
  }

  const handleContinueToSummary = async () => {
    setFeedback(null)

    const ok = await trigger(['customerName', 'customerPhone', 'customerEmail'])
    if (!ok) {
      setFeedback({ type: 'error', message: 'Please complete your contact details' })
      return
    }

    goToStep(3, true)
  }

  return (
    <div className="">
      <div className="mb-6 text-sm flex items-center gap-2 text-gray-500">
        {breadcrumbs.map((crumb, idx) => {
          const isCompleted = crumb.step < step
          const isCurrent = crumb.step === step
          const isClickable = crumb.step <= step

          return (
            <React.Fragment key={crumb.step}>
              <span
                role="button"
                tabIndex={isClickable ? 0 : -1}
                onClick={() => {
                  if (!isClickable) return
                  if (crumb.step === step) return
                  goToStep(crumb.step as 1 | 2 | 3, true)
                }}
                className={
                  `${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} ` +
                  (isCurrent
                    ? 'font-semibold text-gray-900'
                    : isCompleted
                      ? 'font-semibold text-primary'
                      : 'text-gray-500')
                }
              >
                {crumb.label}
              </span>
              {idx < breadcrumbs.length - 1 && <span className="text-gray-400">&gt;</span>}
            </React.Fragment>
          )
        })}
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">{stepTitles[step]}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: formul */}
          <div className={step === 3 ? 'hidden' : 'w-full lg:w-2/5 space-y-6'}>
            <div className="space-y-4">
              {step === 1 && (
                <CheckoutEventDetails
                  control={control}
                  errors={errors}
                  options={options}
                  effectivePricingData={effectivePricingData}
                  currency={currency}
                  currencySymbol={getCurrencySymbol()}
                  isPerTime={isPerTime}
                  hasHourly={hasHourly}
                  hasDaily={hasDaily}
                  hasGuest={hasGuest}
                  bookingType={bookingType}
                  setBookingType={(value) => setBookingType(value)}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  startTime={startTime}
                  endTime={endTime}
                  setCheckInDate={setCheckInDate}
                  setCheckOutDate={setCheckOutDate}
                  setStartTime={setStartTime}
                  setEndTime={setEndTime}
                  minStartTime={minStartTime}
                  minEndTime={minEndTime}
                  maxGuests={maxGuests}
                  effectiveMinimHours={effectiveMinimHours ?? null}
                  effectiveMinimGuests={effectiveMinimGuests ?? null}
                  onContinue={handleContinueToContact}
                  canContinue={canContinueStep1}
                />
              )}

              {step === 2 && (
                <CheckoutContact
                  control={control}
                  errors={errors}
                  onContinue={handleContinueToSummary}
                  canContinue={canContinueStep2}
                  isLogged={Boolean(userData?.email)}
                />
              )}
            </div>
          </div>

          {/* RIGHT: summary */}
          <div className="w-full lg:w-3/5">
            {step === 3 ? (
              <CheckoutSummary
                location={location}
                restaurantSlug={restaurantSlug}
                bookingSummary={{
                  checkIn: bookingSummaryData?.checkIn,
                  checkOut: bookingSummaryData?.checkOut,
                  guests: bookingSummaryData?.guests,
                  pricePerDay,
                  categoryName: bookingSummaryData?.categoryName,
                  bookingType: bookingSummaryData?.bookingType,
                  pricing: location.pricing,
                  approvalDays: location.approvalDays,
                  customerName: watchedValues.customerName,
                  customerEmail: watchedValues.customerEmail,
                  customerPhone: watchedValues.customerPhone,
                }}
                control={control}
                showCreateAccount={showCreateAccount}
                isSubmitting={isSubmitting}
                isLoading={isLoading}
                feedback={feedback}
              />
            ) : (
              <CheckoutSidebar
                location={location}
                restaurantSlug={restaurantSlug}
                bookingSummary={{
                  checkIn: bookingSummaryData?.checkIn,
                  checkOut: bookingSummaryData?.checkOut,
                  guests: bookingSummaryData?.guests,
                  pricePerDay,
                  categoryName: bookingSummaryData?.categoryName,
                  bookingType: bookingSummaryData?.bookingType,
                  pricing: location.pricing,
                  approvalDays: location.approvalDays,
                }}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

const Checkout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLocationData = async (slugValue: string) => {
    try {
      setLoading(true)
      const { status, response } = await getLocationBySlug(slugValue)
      if (status === 200) {
        setLocation(response?.data)
      }
    } catch (error) {
      console.error('Error fetching location data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchLocationData(slug)
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">Booking not found</div>
      </div>
    )
  }

  return <CheckoutInner location={location} restaurantSlug={slug ?? ''} />
}

export default Checkout