import OneSignal from 'react-onesignal';

interface OneSignalInitConfig {
  appId: string;
  allowLocalhostAsSecureOrigin?: boolean;
  notifyButton?: {
    enable?: boolean;
  };
  promptOptions?: {
    slidedown?: {
      prompts?: Array<{
        type: string;
        autoPrompt: boolean;
        text: {
          actionMessage: string;
          acceptButton: string;
          cancelButton: string;
        };
        delay?: {
          pageViews: number;
          timeDelay: number;
        };
      }>;
    };
  };
}

export const initOneSignal = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const config: OneSignalInitConfig = {
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV !== 'production',
      notifyButton: {
        enable: true,
      },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "push",
              autoPrompt: true,
              text: {
                actionMessage: "Gostaria de receber notificações sobre atualizações importantes?",
                acceptButton: "Permitir",
                cancelButton: "Cancelar",
              },
              delay: {
                pageViews: 1,
                timeDelay: 10
              }
            }
          ]
        }
      }
    };
    
    await OneSignal.init(config);
    
    console.log('OneSignal inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar OneSignal:', error);
    return false;
  }
};
