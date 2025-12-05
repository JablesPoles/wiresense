import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Smile, Plug, Wifi, Settings, Activity, Zap } from 'lucide-react';

// Passos do tutorial, cada um com título, descrição e ícone
const tutorialSteps = [
  {
    title: "Passo 1: Bem-vindo ao WireSense!",
    description: "Olá! Vamos te guiar passo a passo na configuração inicial do seu dispositivo para você começar a usar o quanto antes.",
    icon: Smile,
  },
  {
    title: "Passo 2: Ligue o Dispositivo",
    description: "Para começar, conecte seu WireSense a uma fonte de energia usando o cabo USB fornecido.",
    icon: Plug,
  },
  {
    title: "Passo 3: Conecte-se ao WireSense",
    description: "Agora, no seu celular ou computador, abra as configurações de Wi-Fi. Procure pela rede chamada 'WireSense-AP' e conecte-se a ela.",
    icon: Wifi,
  },
  {
    title: "Passo 4: Configure sua rede Wi-Fi",
    description: "Após conectar, uma página de configuração deve abrir automaticamente. Se não abrir, digite 192.168.4.1 no seu navegador para definir a qual rede Wi-Fi o seu WireSense irá se conectar.",
    icon: Settings,
  },
  {
    title: "Passo 5: Comece a Medir",
    description: "Com cuidado, encaixe o alicate amperímetro ao redor de um dos fios do aparelho que deseja medir. A medição aparecerá na tela do WireSense.",
    icon: Activity,
  },
  {
    title: "Tudo Pronto!",
    description: "Parabéns! Seu WireSense está configurado e pronto para uso. Aproveite todas as funcionalidades.",
    icon: Zap,
  },
];

const Tutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Avança para o próximo passo
  const handleNext = () => {
    if (currentStep < tutorialSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Volta para o passo anterior
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === tutorialSteps.length - 1;
  const stepContent = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-xl shadow-2xl p-8 max-w-lg w-full flex flex-col items-center relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botão de fechar tutorial */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          aria-label="Fechar tutorial"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Animação da transição entre passos */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="text-center flex flex-col items-center w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-32 h-32 mb-8 bg-muted/30 rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
              {/* Render Icon Component */}
              <stepContent.icon size={64} className="text-primary animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              {stepContent.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {stepContent.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Indicadores de passo */}
        <div className="flex justify-center gap-2 my-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === index ? 'w-8 bg-primary shadow-lg shadow-primary/50' : 'w-2 bg-muted'
                }`}
            />
          ))}
        </div>

        {/* Botões de navegação */}
        <div className="flex justify-between w-full items-center pt-4 border-t border-border mt-auto">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 0
              ? 'opacity-0 pointer-events-none'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          <button
            onClick={isLastStep ? onComplete : handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
          >
            {isLastStep ? (
              <>Concluir <Check size={16} /></>
            ) : (
              <>Próximo <ChevronRight size={16} /></>
            )}
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default Tutorial;
