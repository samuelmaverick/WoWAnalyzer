import { createContext, ReactNode, useContext, useMemo } from 'react';
import { WCLFight } from 'parser/core/Fight';

interface FightContext {
  fight: WCLFight;
}
const FightCtx = createContext<FightContext | undefined>(undefined);

export default FightCtx;

export const useFight = () => {
  const ctx = useContext(FightCtx);
  if (ctx === undefined) {
    throw new Error('Unable to get fight');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
  fight: WCLFight;
}
export const FightProvider = ({ children, fight }: Props) => {
  const providerValue = useMemo(() => ({ fight }), [fight]);

  return <FightCtx.Provider value={providerValue}>{children}</FightCtx.Provider>;
};
