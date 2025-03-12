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

let isOneSignalInitialized = false;

export const initOneSignal = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  if (isOneSignalInitialized) {
    console.log('OneSignal já foi inicializado anteriormente.');
    return true;
  }
  
  const isDev = process.env.NODE_ENV === 'development';
  const allowLocalhost = true; 
  
  if (isDev && !allowLocalhost && window.location.hostname === 'localhost') {
    console.log('OneSignal não inicializado em ambiente de desenvolvimento local.');
    return false;
  }
  
  try {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    
    if (!appId) {
      console.error("OneSignal AppID não está configurado!");
      return false;
    }
    
    const config: OneSignalInitConfig = {
      appId,
      allowLocalhostAsSecureOrigin: true,
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
    isOneSignalInitialized = true;
    console.log('OneSignal inicializado com sucesso');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message && 
        error.message.includes('This web push config can only be used on')) {
      console.warn('OneSignal: Erro de configuração de domínio. Você precisa adicionar este domínio no painel do OneSignal.');
    } else {
      console.error('Erro ao inicializar OneSignal:', error);
    }
    return false;
  }
};

