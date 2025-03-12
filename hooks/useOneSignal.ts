import OneSignal from 'react-onesignal';

interface UserData {
  id: string;
  email: string;
  name: string;
  user_type: 'Admin' | 'SDR' | 'Parceiro' | 'Super admin';
  unit_id?: string;
}

export const useOneSignal = () => {
  const identifyUser = async (userData: UserData): Promise<void> => {
    try {
      if (!OneSignal || !OneSignal.User) {
        console.warn('OneSignal is not properly initialized');
        return;
      }

      await OneSignal.login(userData.id);
      
      await OneSignal.User.addTags({
        email: userData.email,
        nome: userData.name,
        tipo_usuario: userData.user_type,
        unit_id: userData.unit_id || ''
      });
      
      console.log('User identified in OneSignal');
    } catch (error) {
      console.error('Error identifying user in OneSignal:', error);
    }
  };

  const removeIdentification = async (): Promise<void> => {
    try {
      if (!OneSignal) {
        console.warn('OneSignal is not properly initialized');
        return;
      }

      await OneSignal.logout();
      console.log('User logged out from OneSignal');
    } catch (error) {
      console.error('Error removing user identification:', error);
    }
  };

  const checkPermissionStatus = async (): Promise<boolean> => {
    try {
      if (!OneSignal || !OneSignal.Notifications) {
        return false;
      }
      
      const permission = await OneSignal.Notifications.permission;
      return permission;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      if (!OneSignal || !OneSignal.Notifications) {
        return false;
      }
      
      await OneSignal.Notifications.requestPermission();
      return await OneSignal.Notifications.permission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  return { 
    identifyUser, 
    removeIdentification,
    checkPermissionStatus,
    requestNotificationPermission
  };
};
