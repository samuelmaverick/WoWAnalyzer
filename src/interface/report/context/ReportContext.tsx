import { createContext, ReactNode, useContext, useMemo } from 'react';
import Report from 'parser/core/Report';

interface ReportContext {
  report: Report;
  refreshReport: () => void;
}
const ReportCtx = createContext<ReportContext | undefined>(undefined);

export const useReport = () => {
  const ctx = useContext(ReportCtx);
  if (ctx === undefined) {
    throw new Error('Unable to get report');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
  report: Report;
  refreshReport: () => void;
}
export const ReportProvider = ({ children, report, refreshReport }: Props) => {
  const providerValue = useMemo(() => ({ report, refreshReport }), [report, refreshReport]);

  return <ReportCtx.Provider value={providerValue}>{children}</ReportCtx.Provider>;
};
