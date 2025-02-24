export function formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cleaned;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  export function cleanCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }
  
  export function isValidCPF(cpf: string): boolean {
    const cleaned = cleanCPF(cpf);
    if (cleaned.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cleaned)) return false;
    
    return true;
  }
  