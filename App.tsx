import React from 'react';
import Fontloader from './components/FondLoader';

import AppNavigator from './Navigation/AppNavigation';

export default function App() {
  return (
    <Fontloader>
      <AppNavigator/>
    </Fontloader>
  );
}


