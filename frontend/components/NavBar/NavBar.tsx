import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useWeb3React } from '@web3-react/core';
import { StyledNavBar } from './NavBar.styles';
import { connectors } from '../../utils/connectors';

const NavBar = () => {
  const [, setModalOpen] = useState(false);
  const { account, activate, deactivate } = useWeb3React();

  const refreshState = () => {
    window.localStorage.setItem('provider', '');
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  useEffect(() => {
    const provider: string | null = window.localStorage.getItem('provider');
    if (provider) activate(connectors[provider]);
  }, []);

  return (
    <StyledNavBar>
      <div className="logo">NextJS/Hardhat Template</div>
      <div className="account-section">
        <div
          onClick={() => (account ? disconnect() : setModalOpen(true))}
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
