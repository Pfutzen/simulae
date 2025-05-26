
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onValidPassword: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  onValidPassword
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setAttemptCount(0);
      setIsBlocked(false);
      setBlockTimeLeft(0);
    }
  }, [isOpen]);

  // Handle block timer
  useEffect(() => {
    if (blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(blockTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false);
      setAttemptCount(0);
    }
  }, [blockTimeLeft, isBlocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) return;
    
    setIsLoading(true);
    setError('');

    // Simulate validation delay
    setTimeout(() => {
      if (password === '1234') {
        // Correct password
        onValidPassword();
        setPassword('');
        setError('');
        setAttemptCount(0);
      } else {
        // Wrong password
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        if (newAttemptCount >= 3) {
          setIsBlocked(true);
          setBlockTimeLeft(10); // 10 seconds block
          setError('Muitas tentativas incorretas. Tente novamente em 10 segundos.');
        } else {
          setError(`Senha incorreta. Tentativa ${newAttemptCount} de 3.`);
        }
        
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">Sessão Expirada</DialogTitle>
          <DialogDescription className="text-slate-600">
            Sua sessão expirou por inatividade. Por favor, insira sua senha para continuar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="timeout-password">Senha</Label>
            <Input
              id="timeout-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={isLoading || isBlocked}
              required
              autoFocus
            />
          </div>

          {error && (
            <Alert className="bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full bg-simulae-600 hover:bg-simulae-700" 
            disabled={isLoading || isBlocked || !password.trim()}
          >
            {isLoading ? 'Verificando...' : isBlocked ? `Bloqueado (${blockTimeLeft}s)` : 'Entrar'}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-4">
          <p>Por segurança, sua sessão é bloqueada após 10 minutos de inatividade.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutModal;
