'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addAllCategories } from '@/scripts/add-categories';
import { toast } from 'sonner';

export function AddCategoriesButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCategories = async () => {
    try {
      setIsLoading(true);
      const result = await addAllCategories();
      
      if (result) {
        toast.success('Todas las categorías han sido agregadas correctamente.');
      } else {
        toast.error('Hubo un problema al agregar las categorías.');
      }
    } catch (error) {
      console.error('Error al agregar categorías:', error);
      toast.error('Hubo un problema al agregar las categorías.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddCategories} 
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? 'Agregando categorías...' : 'Agregar todas las categorías predefinidas'}
    </Button>
  );
}