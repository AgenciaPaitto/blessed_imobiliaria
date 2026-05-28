import { useState, useEffect } from "react";
import { formatCurrency } from "../utils";
import { Calculator } from "lucide-react";

interface MortgageCalculatorProps {
  propertyValue?: number;
}

export default function MortgageCalculator({ propertyValue = 500000 }: MortgageCalculatorProps) {
  const [value, setValue] = useState(propertyValue);
  const [downPayment, setDownPayment] = useState(propertyValue * 0.2);
  const [years, setYears] = useState(30);
  const [interestRate, setInterestRate] = useState(10.5); // taxa anual
  
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [financedAmount, setFinancedAmount] = useState(0);

  useEffect(() => {
    // Calculo Tabela Price (simplificado)
    const principal = value - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (principal > 0 && monthlyRate > 0 && numberOfPayments > 0) {
      const payment = 
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      setMonthlyPayment(payment);
      setFinancedAmount(principal);
    } else {
      setMonthlyPayment(0);
      setFinancedAmount(0);
    }
  }, [value, downPayment, years, interestRate]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Simulador de Financiamento</h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Imóvel (R$)</label>
            <input 
              type="number" 
              value={value} 
              onChange={e => setValue(Number(e.target.value))}
              className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Entrada (R$)</label>
            <input 
              type="number" 
              value={downPayment} 
              onChange={e => setDownPayment(Number(e.target.value))}
              className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
            />
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: mínimo de 20% ({formatCurrency(value * 0.2)})
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (Anos)</label>
              <input 
                type="number" 
                value={years} 
                onChange={e => setYears(Number(e.target.value))}
                className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taxa Juros a.a. (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={interestRate} 
                onChange={e => setInterestRate(Number(e.target.value))}
                className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
              />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-gray-500 font-medium mb-4">Resultado da Simulação</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Valor Financiado:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(financedAmount)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Prazo em Meses:</span>
                <span className="font-semibold text-gray-900">{years * 12} meses</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Parcela Estimada:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyPayment)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs text-gray-500 mb-4 text-justify">
              * Valores simulados baseados na Tabela Price. As taxas reais podem variar de acordo com o perfil de crédito, agente financeiro e modalidade de financiamento. Para uma simulação precisa, consulte um de nossos corretores.
            </p>
            <a href="https://wa.me/5565999999999?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20um%20consultor%20sobre%20financiamento%20imobili%C3%A1rio." target="_blank" rel="noreferrer" className="block w-full text-center bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2.5 rounded-lg transition">
              Falar com Consultor de Financiamento
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
