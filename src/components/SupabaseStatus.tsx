
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIndicesSupabase } from '@/hooks/useIndicesSupabase';
import { Loader2, Database, AlertCircle } from 'lucide-react';

const SupabaseStatus: React.FC = () => {
  const { indices, loading, error } = useIndicesSupabase();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          Status dos Índices Econômicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando índices do Supabase...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <Badge variant="secondary">Usando dados locais</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <Database className="h-4 w-4" />
            <span>✅ Conectado ao Supabase</span>
            <Badge variant="default">{indices.length} meses carregados</Badge>
          </div>
        )}
        
        {indices.length > 0 && (
          <div className="mt-3 text-sm text-slate-600">
            <p>Último período: {indices[indices.length - 1]?.mes_ano}</p>
            <p>Total de registros: {indices.length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseStatus;
