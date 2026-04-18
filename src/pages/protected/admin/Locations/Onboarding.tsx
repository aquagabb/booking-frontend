import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import CustomInput from '../../../../components/shared/CustomInput'
import CustomTextarea from '../../../../components/shared/CustomTextarea'
import CustomSelect from '../../../../components/shared/CustomSelect'
import { getGeneralData } from '../../../../api/others/others'
import { toSelectOptions } from '../../../../lib/utils'

type SelectOption = {
  value: string | number
  label: string
}

type FormValues = {
  name: string
  description: string
  address: string
  categories: number[]
}

const Onboarding = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)
  const [categories, setCategories] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      address: '',
      categories: [],
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const { status, response } = await getGeneralData()
        if (status === 200) {
          const formatted = toSelectOptions(response?.data?.categories || [])
          setCategories(formatted)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const onSubmit = async (data: FormValues) => {
    try {
      console.log('Form data:', data)
      // TODO: Implement API call to create location
      // await createLocation(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      {/* Full screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-white rounded-xl w-full h-full max-w-4xl flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-2xl font-semibold text-gray-900">
              {t('locations.create_location') || 'Adaugă o locație nouă'}
            </Dialog.Title>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Name */}
            <Controller
              name="name"
              control={control}
              rules={{ required: t('common.required') as string }}
              render={({ field }) => (
                <CustomInput
                  label={t('locations.name')}
                  placeholder={t('locations.name_placeholder')}
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={errors.name?.message as string}
                />
              )}
            />

            {/* Address */}
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label={t('locations.address')}
                  placeholder={t('locations.address_placeholder')}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.address?.message as string}
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <CustomTextarea
                  label={t('locations.description')}
                  placeholder={t('locations.description_placeholder')}
                  rows={6}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.description?.message as string}
                />
              )}
            />

            {/* Categories */}
            <div>
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('locations.categories')}
                    isMulti
                    options={categories}
                    value={categories.filter((o) =>
                      field.value?.includes(Number(o.value)) || false
                    )}
                    onChange={(opts: any) =>
                      field.onChange(opts ? opts.map((o: any) => Number(o.value)) : [])
                    }
                    placeholder={isLoading ? t('common.loading') || 'Loading...' : t('locations.categories') || 'Select categories'}
                    isDisabled={isLoading}
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                {t('common.cancel') || 'Anulează'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t('common.saving') || 'Salvare...'
                  : t('common.save') || 'Salvează'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default Onboarding