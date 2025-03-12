interface NotificationPayload {
    app_id: string;
    include_external_user_ids: string[];
    contents: {
      en: string;
      pt: string;
    };
    headings: {
      en: string;
      pt: string;
    };
    data?: Record<string, any>;
  }
  
  export const enviarNotificacaoMudancaStatus = async (
    referralId: string, 
    novoStatus: string, 
    userId: string
  ): Promise<any> => {
    try {
      const payload: NotificationPayload = {
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
        include_external_user_ids: [userId],
        contents: {
          en: `A indicação foi atualizada para: ${novoStatus}`,
          pt: `A indicação foi atualizada para: ${novoStatus}`
        },
        headings: {
          en: "Atualização de Status",
          pt: "Atualização de Status"
        },
        data: {
          referralId,
          status: novoStatus,
          redirectTo: `/referrals/${referralId}`
        }
      };
  
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${process.env.NEXT_PUBLIC_ONESIGNAL_REST_API_KEY || ""}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Notificação enviada:', data);
      return data;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      throw error;
    }
  };
  