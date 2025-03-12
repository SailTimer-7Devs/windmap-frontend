declare module 'react-fps-stats' {
  interface FPSStatsProps {
    top?: number | string;
    right?: number | string | 'auto';
    bottom?: number | string | 'auto';
    left?: number | string;
  }

  const FPSStats: React.FC<FPSStatsProps>;
  export default FPSStats;
}
