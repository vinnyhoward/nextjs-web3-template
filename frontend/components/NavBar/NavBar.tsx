import Image from 'next/image';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { StyledNavBar } from './NavBar.styles';

const NavBar = () => {
  const { address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  return (
    <StyledNavBar>
      <div className="logo">NextJS/Hardhat Template</div>
      <div className="account-section">
        <div
          onClick={() => (address ? disconnect() : connect())}
          className="icon"
        >
          <Image
            src="/svgs/wallet_icon.svg"
            alt="wallet icon"
            width={25}
            height={25}
          />
        </div>
      </div>
    </StyledNavBar>
  );
};

export default NavBar;
