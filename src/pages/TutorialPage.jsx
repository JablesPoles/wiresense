import React, {useState} from "react";
import { motion, AnimatePresence } from 'framer-motion'; 
import { X } from 'lucide-react'; 

const tutorialSteps = [
    {
        title: "Passo 1: Bem-vindo ao WireSense!",
        description: "Olá! Vamos te guiar passo a passo na configuração inicial do seu dispositivo para você começar a usar o quanto antes.",
        image: '/images/step1-welcome.svg',
    },
    {
        title: "Passo 2: Ligue o Dispositivo",
        description: "Para começar, conecte seu WireSense a uma fonte de energia usando o cabo USB fornecido.",
        image: '/images/step2-connect.svg', 
    },
    {
        title: "Passo 3: Conecte-se ao WireSense",
        description: "Agora, no seu celular ou computador, abra as configurações de Wi-Fi. Procure pela rede chamada 'WireSense-AP' e conecte-se a ela.",
        image: '/images/step3-APMode.svg',
    },
        {
        title: "Passo 4: Configure sua rede Wi-Fi",
        description: "Após conectar, uma página de configuração deve abrir automaticamente. Se não abrir, digite 192.168.4.1 no seu navegador para definir a qual rede Wi-Fi o seu WireSense irá se conectar.",
        image: '/images/step4-WiFi.svg', 
    },
    {
        title: "Passo 5: Comece a Medir",
        description: "Com cuidado, encaixe o alicate amperímetro ao redor de um dos fios do aparelho que deseja medir. A medição aparecerá na tela do WireSense.",
        image: '/images/step5-finalstep.svg', 
    },
    {
        title: "Tudo Pronto!",
        description: "Parabéns! Seu WireSense está configurado e pronto para uso. Aproveite todas as funcionalidades.",
        image: '/images/step6-congratulations.svg',
    },
]

const Tutorial = ({onComplete}) => {
    const[currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if(currentStep < tutorialSteps.length){
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

    const isLastStep = currentStep === tutorialSteps.length - 1;
    const stepContent = tutorialSteps[currentStep];

     return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full flex flex-col items-center relative">
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Fechar tutorial"
        >
          <X className="h-6 w-6" />
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="text-center flex flex-col items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }} 
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <img src={stepContent.image} alt={stepContent.title} className="w-48 h-48 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {stepContent.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {stepContent.description}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 my-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentStep === index ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between w-full">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}
          
          <button
            onClick={isLastStep ? onComplete : handleNext}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
          >
            {isLastStep ? 'Concluir' : 'Próximo'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Tutorial;