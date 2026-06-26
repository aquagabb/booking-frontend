import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import CustomInput from '../components/shared/CustomInput'
import LoginModal from './protected/client/Reservations/LoginModal'

type CheckoutContactProps = {
  // Containerul gestionează react-hook-form; aici folosim tip `any` ca să nu cuplăm direct la structura FormValues.
  control: any
  errors: any
  onContinue: () => void
  canContinue: boolean
  /** Din container: user cu email în sesiune / localStorage */
  isLogged: boolean
}

const CheckoutContact: React.FC<CheckoutContactProps> = ({
  control,
  errors,
  onContinue,
  canContinue,
  isLogged,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const location = useLocation()
  const postLoginRedirect = `${location.pathname}${location.search}`

  return (
    <>
      {!isLogged && (
        <div className="mb-8">
          <p className="mb-4 text-center text-base text-gray-600">
            Conectează-te pentru a folosi datele contului.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 min-w-0 [&>button]:w-full [&>button]:h-12 [&>button]:rounded-lg [&>button]:flex [&>button]:items-center [&>button]:justify-center">
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                Conectează-te
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="text-sm text-gray-500">sau</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 space-y-4">
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
              message: 'Invalid phone number format',
            },
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
            message: 'Invalid email address',
          },
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

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className={`w-full font-medium py-3 px-4 rounded-xl transition disabled:opacity-50 bg-primary text-white`}
      >
        Continua
      </button>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        postLoginRedirect={postLoginRedirect}
      />
    </>
  )
}

export default CheckoutContact
