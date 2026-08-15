

import HeaderAdmin from './HeaderAdmin';

const Header = () => {

    const pathname = window.location.pathname;
    if (pathname.startsWith('/login')) {
        return false;
    }
    return (
      <HeaderAdmin />
    );
};

export default Header;
