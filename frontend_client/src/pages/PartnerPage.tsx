import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  Eye,
  Calendar,
  Bell,
  MessageSquare,
  Settings,
  FileText,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
} from "lucide-react";

const PartnerLandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary/5">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Left content */}
            <div className="lg:w-3/5 space-y-8 z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-primary/20">
                <Zap className="w-4 h-4" />
                <span>Platformă pentru parteneri</span>
              </div>

              {/* Main heading */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900">
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {t("partner.hero_title")}
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                  {t("partner.hero_subtitle")}
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                <button
                  onClick={() => navigate("/join/register")}
                  className="group relative bg-gradient-to-r from-primary to-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t("partner.register_cta")}
                    <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
             
              </div>
            </div>

            {/* Right visual element - Dashboard mockup */}
            <div className="lg:w-2/5 flex items-center justify-center relative">
              <div className="relative w-full max-w-lg">
                {/* Animated gradient orbs */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-primary/30 to-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 -left-20 w-48 h-48 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
                
                {/* Dashboard mockup card */}
                <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl p-6 border border-gray-200/50 overflow-hidden backdrop-blur-xl">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-500">Dashboard Preview</div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">1,247</div>
                      <div className="text-xs text-gray-500 mt-1">Rezervări</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">892</div>
                      <div className="text-xs text-gray-500 mt-1">Clienți</div>
                    </div>
                  </div>

                  {/* Activity chart mockup */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Activitate săptămânală</span>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-end justify-between gap-2 h-24">
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg" style={{ height: '60%' }}></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg" style={{ height: '80%' }}></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg" style={{ height: '45%' }}></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg" style={{ height: '90%' }}></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg" style={{ height: '70%' }}></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg" style={{ height: '85%' }}></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg" style={{ height: '65%' }}></div>
                    </div>
                  </div>

                  {/* Recent activity */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-700">Rezervare nouă</div>
                        <div className="text-xs text-gray-400">Acum 5 minute</div>
                      </div>
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-700">Mesaj nou</div>
                        <div className="text-xs text-gray-400">Acum 12 minute</div>
                      </div>
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-3 shadow-xl animate-bounce">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-2.5 shadow-xl">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-1/2 -right-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full p-2.5 shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Overview - 4 Cards */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("partner.benefits_overview_title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("partner.benefits_overview_subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                {t("partner.benefit_card1_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("partner.benefit_card1_desc")}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                {t("partner.benefit_card2_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("partner.benefit_card2_desc")}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                {t("partner.benefit_card3_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("partner.benefit_card3_desc")}
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border border-orange-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                {t("partner.benefit_card4_title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("partner.benefit_card4_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Management Features */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("partner.management_title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("partner.management_subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <Settings className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t("partner.management_feature1_title")}</h3>
              <p className="text-gray-600 text-sm">{t("partner.management_feature1_desc")}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <FileText className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t("partner.management_feature2_title")}</h3>
              <p className="text-gray-600 text-sm">{t("partner.management_feature2_desc")}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t("partner.management_feature3_title")}</h3>
              <p className="text-gray-600 text-sm">{t("partner.management_feature3_desc")}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <BarChart3 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t("partner.management_feature4_title")}</h3>
              <p className="text-gray-600 text-sm">{t("partner.management_feature4_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Venue, Your Rules */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                {t("partner.rules_badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t("partner.rules_title")}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t("partner.rules_subtitle")}
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("partner.rules_point1_title")}</h3>
                    <p className="text-gray-600 text-sm">{t("partner.rules_point1_desc")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("partner.rules_point2_title")}</h3>
                    <p className="text-gray-600 text-sm">{t("partner.rules_point2_desc")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("partner.rules_point3_title")}</h3>
                    <p className="text-gray-600 text-sm">{t("partner.rules_point3_desc")}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("partner.rules_highlight1")}</h3>
                    <p className="text-sm text-gray-600">{t("partner.rules_highlight1_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("partner.rules_highlight2")}</h3>
                    <p className="text-sm text-gray-600">{t("partner.rules_highlight2_desc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("partner.rules_highlight3")}</h3>
                    <p className="text-sm text-gray-600">{t("partner.rules_highlight3_desc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visibility & Growth */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-primary/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              {t("partner.visibility_badge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("partner.visibility_title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("partner.visibility_subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">{t("partner.visibility_point1_title")}</h3>
              <p className="text-gray-600">{t("partner.visibility_point1_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">{t("partner.visibility_point2_title")}</h3>
              <p className="text-gray-600">{t("partner.visibility_point2_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">{t("partner.visibility_point3_title")}</h3>
              <p className="text-gray-600">{t("partner.visibility_point3_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("partner.faq_title")}
            </h2>
            <p className="text-lg text-gray-600">
              {t("partner.faq_subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(num)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">
                    {t(`partner.faq${num}_question`)}
                  </span>
                  {openFaq === num ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === num && (
                  <div className="px-6 pb-6 text-gray-600">
                    {t(`partner.faq${num}_answer`)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t("partner.final_cta_title")}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t("partner.final_cta_subtitle")}
          </p>
          <button
            onClick={() => navigate("/join/register")}
            className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
          >
            {t("partner.final_cta_button")}
          </button>
          <p className="text-sm text-white/80 mt-6">
            {t("partner.disclaimer")}
          </p>
        </div>
      </section>
    </div>
  );
};

export default PartnerLandingPage;
