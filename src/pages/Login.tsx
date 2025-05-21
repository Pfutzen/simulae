
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      if (username === "teste" && password === "1234") {
        // Store authentication in sessionStorage
        sessionStorage.setItem("isAuthenticated", "true");
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
        toast.error("Usuário ou senha incorretos. Tente novamente.");
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/c2a68237-fb14-4957-891c-3d3581836ace.png" 
              alt="Simulae Logo" 
              className="h-16 md:h-20 mb-2"
            />
            <p className="text-slate-600 mt-1">
              Simulador de investimento imobiliário para imóveis na planta
            </p>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">Acesso ao Sistema</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-simulae-600 hover:bg-simulae-700" 
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          © 2025 Simulae. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Login;
