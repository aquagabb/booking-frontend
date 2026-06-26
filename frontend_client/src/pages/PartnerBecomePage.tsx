import PartnerRegister from './PartnerRegister'
import Register from './auth/Register'
import { useUserStore } from '../store/user.store'
import { Users, TrendingUp, Shield } from 'lucide-react'

const PartnerBecomePage = () => {
  const user = useUserStore((state) => state.user)

  const benefits = [
    {
      icon: Users,
      title: 'Acces la mii de clienți',
      description: 'Conectează-te cu o comunitate activă de utilizatori care caută restaurante de calitate'
    },
    {
      icon: TrendingUp,
      title: 'Creștere a rezervărilor',
      description: 'Sistem inteligent de management care îți maximizează ocuparea și veniturile'
    },
    {
      icon: Shield,
      title: 'Platformă sigură și fiabilă',
      description: 'Tehnologie avansată pentru gestionarea rezervărilor cu securitate și eficiență maximă'
    }
  ]

  // Dacă utilizatorul nu este logat, afișăm formularul de Register
  if (!user) {
    return (
      <div className="flex h-auto">
        {/* Left Panel - Promotional/Informational */}
        <div className="hidden lg:flex lg:w-1/2 border-r border-gray-200">
          <div className="flex flex-col py-12 mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Devino Partener
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                Alătură-te platformei noastre și transformă modul în care gestionezi rezervările. Creează un cont pentru a începe.
              </p>
            </div>

            <div className="space-y-5">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                        {benefit.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-start justify-center bg-white px-4 pt-8 pb-12 lg:px-12 lg:pt-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Devino Partener
              </h1>
              <p className="text-gray-600">
                Creează un cont pentru a începe
              </p>
            </div>
            <Register redirectPath="/join/register" />
          </div>
        </div>
      </div>
    )
  }

  // Dacă utilizatorul este logat, afișăm formularul de înregistrare ca partener
  return (
    <div className="flex h-auto">
      {/* Left Panel - Promotional/Informational */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-gray-200">
        <div className="flex flex-col px-8 py-12  mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Completează Informațiile
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Finalizează înregistrarea ca partener completând detaliile despre restaurantul tău. În câteva minute vei putea începe să primești rezervări.
            </p>
          </div>

          <div className="space-y-5">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center bg-white px-4 pt-8 pb-12 lg:px-12 lg:pt-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Completează Informațiile
            </h1>
            <p className="text-gray-600">
              Finalizează înregistrarea ca partener
            </p>
          </div>
          <PartnerRegister />
        </div>
      </div>
    </div>
  )
}

export default PartnerBecomePage