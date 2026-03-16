import { Suspense } from 'react';
import CalculatorForm from '../components/Calculator/CalculatorForm';

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading calculator...</div>}>
      <CalculatorForm />
    </Suspense>
  );
}
