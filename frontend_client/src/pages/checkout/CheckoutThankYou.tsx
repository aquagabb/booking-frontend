import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Check, CheckCircle2, Copy, MapPin, Users } from 'lucide-react'
import { getBookingById } from '../../api/bookings/bookings'
import { formatDate } from '../../lib/utils'
import { useUserStore } from '../../store/user.store'

type BookingSummary = {
  id: string | number
  code: string
  locationName: string
  locationAddress?: string
  guests: number
  checkIn: string
  checkOut: string
  status: string
}

const CheckoutThankYou = () => {
  const { id, code } = useParams<{ id: string; code: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const isLogged = Boolean(user?.email)

  const [booking, setBooking] = useState<BookingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        setLoading(false)
        setError(t('reservations.not_found'))
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { status, response } = await getBookingById(
          id,
          { type: 'customer', code },
          isLogged,
        )

        if (status === 200 && response?.data) {
          const data = response.data
          setBooking({
            id: data.id,
            code: data.code,
            locationName: data.locationName || t('reservations.restaurant'),
            locationAddress: data.locationAddress,
            guests: data.guests ?? 0,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            status: data.status,
          })
        } else {
          setError(t('reservations.not_found'))
        }
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError(t('reservations.load_error'))
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id, code, isLogged, t])

  const handleCopyCode = async () => {
    if (!booking?.code) return
    try {
      await navigator.clipboard.writeText(booking.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
        {t('reservations.loading')}
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-600">{error || t('reservations.not_found')}</p>
        <Link to="/restaurants" className="text-primary font-medium hover:underline">
          {t('checkout.thank_you_back_to_search')}
        </Link>
      </div>
    )
  }

  const isPending = booking.status === 'pending'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('checkout.thank_you_title')}
        </h1>
        <p className="text-gray-600">
          {isPending
            ? t('checkout.thank_you_pending', { venue: booking.locationName })
            : t('checkout.thank_you_confirmed', { venue: booking.locationName })}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-500">{t('reservations.code')}</p>
            <p className="text-lg font-semibold text-gray-900 tracking-wide">{booking.code}</p>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {t('reservations.copied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t('reservations.copy_code')}
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{booking.locationName}</p>
              {booking.locationAddress && (
                <p className="text-sm text-gray-500">{booking.locationAddress}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-sm text-gray-700">
              {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-sm text-gray-700">
              {booking.guests} {t('reservations.guests').toLowerCase()}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
          {t('checkout.thank_you_email_hint')}
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => navigate(`/booking/view/${booking.id}/${booking.code}`)}
          className="flex-1 font-medium py-3 px-4 rounded-xl bg-primary text-white hover:opacity-90 transition"
        >
          {t('checkout.thank_you_view_details')}
        </button>
        <Link
          to="/restaurants"
          className="flex-1 font-medium py-3 px-4 rounded-xl border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
        >
          {t('checkout.thank_you_back_to_search')}
        </Link>
      </div>
    </div>
  )
}

export default CheckoutThankYou
