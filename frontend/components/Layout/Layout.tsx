import React, { FC } from 'react';
import NavBar from '../NavBar/NavBar';

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <NavBar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
