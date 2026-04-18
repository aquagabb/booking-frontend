import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const footerLinkClass =
  'text-[15px] text-[#333] hover:underline focus:outline-none focus:ring-2 focus:ring-[#333]/20 focus:ring-offset-1 rounded';

const Footer = () => {
  const { t } = useTranslation();
  const langLabel = i18n.language?.startsWith('ro') ? 'Română' : 'English';

  return (
    <footer className="bg-[#f2f2f2] text-[#333] mt-auto mt-10">
      <div className="2xl:max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-10 md:py-12 mt-24">
        {/* 5 columns - same structure as reference */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Asistență */}
          <div>
            <h3 className="text-[15px] font-bold text-[#333] mb-4">
              {t('footer.assistance_title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className={footerLinkClass}>
                  {t('footer.contact_customer_service')}
                </Link>
              </li>
              <li>
                <Link to="/login" className={footerLinkClass}>
                  {t('footer.manage_bookings')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Descoperiți */}
          <div>
            <h3 className="text-[15px] font-bold text-[#333] mb-4">
              {t('footer.discover_title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/restaurants" className={footerLinkClass}>
                  {t('footer.restaurant_reservations')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Termeni și setări */}
          <div>
            <h3 className="text-[15px] font-bold text-[#333] mb-4">
              {t('footer.terms_title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className={footerLinkClass}>
                  {t('footer.privacy_link')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className={footerLinkClass}>
                  {t('footer.terms_link')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Parteneri */}
          <div>
            <h3 className="text-[15px] font-bold text-[#333] mb-4">
              {t('footer.partners_title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/join" className={footerLinkClass}>
                  {t('footer.register_property')}
                </Link>
              </li>
              <li>
                <Link to="/login" className={footerLinkClass}>
                  {t('footer.partner_login')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Despre */}
          <div>
            <h3 className="text-[15px] font-bold text-[#333] mb-4">
              {t('footer.about_title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className={footerLinkClass}>
                  {t('footer.about_us')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Language & currency row */}
        <div className="mt-8 pt-6 border-t border-[#333]/10">
          <p className="text-[13px] text-[#333]/90">
            {t('footer.language_currency')}: {langLabel} · {t('footer.currency_display')}
          </p>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-[#333]/10">
        <div className="2xl:max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-4">
          <p className="text-[12px] text-[#333]/75 text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
