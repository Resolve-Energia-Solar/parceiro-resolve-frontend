export function formatDateForDatabase(dateStr: string): string {
    try {
      if (!dateStr) {
        throw new Error('Data não fornecida');
      }
  
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
  
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
      }
  
      throw new Error('Formato de data inválido');
    } catch (error) {
      console.error('Erro ao formatar data para o banco:', error);
      throw error;
    }
  }
  
  export function isValidDate(dateStr: string): boolean {
    try {
      const date = new Date(dateStr);
      return date instanceof Date && !isNaN(date.getTime());
    } catch {
      return false;
    }
  }
  