import Image from 'next/image';
import { StyledNavBar } from './NavBar.styles';

const NavBar = () => {
  return (
    <StyledNavBar>
      <div className="logo">NotSoRare</div>
      <div className="left-side">
        <div className="navigation-links">
          <div>Collections</div>
          <div>Rewards</div>
        </div>

        <div className="interaction-section">
          <div className="icon">
            <Image
              src="/svgs/bell_icon.svg"
              alt="notifications icon"
              width={25}
              height={25}
            />
          </div>

          <div className="icon">
            <Image
              src="/svgs/moon_icon.svg"
              alt="dark mode icon"
              width={25}
              height={25}
            />
          </div>
        </div>

        <div className="account-section">
          <div className="icon">
            <Image
              src="/svgs/wallet_icon.svg"
              alt="wallet icon"
              width={25}
              height={25}
            />
          </div>
        </div>
      </div>
    </StyledNavBar>
  );
};

export default NavBar;
