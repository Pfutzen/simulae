
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TipoIndice } from '@/types/indices';

interface IndiceEconomico {
  id: number;
  mes_ano: string;
  cub_nacional: number;
  ipca: number;
  igpm: number;
  incc: number;
}

export const useIndicesSupabase = () => {
  const [indices, setIndices] = useState<IndiceEconomico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('indices_economicos')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.error('Erro ao buscar índices:', error);
          setError('Erro ao carregar índices econômicos');
          return;
        }

        console.log('Índices carregados do Supabase:', data);
        setIndices(data || []);
      } catch (err) {
        console.error('Erro na requisição:', err);
        setError('Erro na conexão com o banco de dados');
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
  }, []);

  const getIndicesPorTipo = (tipo: TipoIndice): number[] => {
    if (tipo === 'MANUAL') return [];
    
    const campo = {
      'CUB_NACIONAL': 'cub_nacional',
      'IPCA': 'ipca',
      'IGP_M': 'igpm',
      'INCC_NACIONAL': 'incc'
    }[tipo];

    if (!campo) return [];

    return indices.map(indice => (indice as any)[campo] || 0);
  };

  return {
    indices,
    loading,
    error,
    getIndicesPorTipo
  };
};
