import FPSStats from 'react-fps-stats'

import Mapbox from './Mapbox.tsx';

export default function App() {
  return (
    <div className="relative w-full h-full">
      <Mapbox />

      <FPSStats
        bottom='auto'
        left={0}
        top={0}
        right='auto'
      />
    </div>
  );
}
