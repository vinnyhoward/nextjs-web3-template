import styled from 'styled-components';

export const StyledNavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3rem;
  height: 5rem;
  background-color: #000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;

  div {
    color: white;
  }

  .account-section {
    margin: 0 0 0 1rem;
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 3rem;
    height: 3rem;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background-color: #43464b;
    }
  }
`;
