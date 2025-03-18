export const formatPhoneNumber = (phone: string) => {
    if (!phone) return "—";
  
    const cleaned = phone.replace(/\D/g, '');
  
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
    } else if (cleaned.length === 8) {
      return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}`;
    } else {
      return phone;
    }
  };
  
  export const formatCPF = (cpf: string) => {
    if (!cpf) return "—";
  
    const cleaned = cpf.replace(/\D/g, '');
  
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}`;
    } else {
      return cpf;
    }
  };
  