import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { registerUser } from "../services/authService";
import { alertTheme } from "../lib";
import Swal from "sweetalert2";
import { Words } from "../components/ui";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const aviso = (title, text) => Swal.fire(alertTheme({ icon: "warning", title, text }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return aviso("Senhas diferentes", "As duas senhas precisam ser iguais.");
    }
    if (formData.password.length < 6) {
      return aviso("Senha curta", "Use pelo menos 6 caracteres.");
    }
    if (!/\d/.test(formData.password)) {
      return aviso("Senha fraca", "Inclua pelo menos 1 número.");
    }

    try {
      setLoading(true);
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      await Swal.fire(alertTheme({ icon: "success", title: "Conta criada", text: "Agora é só entrar." }));
      navigate("/login");
    } catch (err) {
      Swal.fire(alertTheme({ icon: "error", title: "Não deu pra cadastrar", text: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="auth">
        <div className="auth-title">
          <Words text="Criar conta" />
          <p>Guarde suas análises e acompanhe a nota subir.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input id="name" type="text" name="name" autoComplete="name" required
              value={formData.name} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" autoComplete="email" required
              value={formData.email} onChange={handleChange} />
          </div>

          <div className="field pw">
            <label htmlFor="password">Senha</label>
            <input id="password" type={showPassword ? "text" : "password"} name="password"
              autoComplete="new-password" required aria-describedby="pw-rule"
              value={formData.password} onChange={handleChange} />
            <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p id="pw-rule" className="muted" style={{ fontSize: "0.875rem", marginTop: -8 }}>
            Mínimo de 6 caracteres e 1 número.
          </p>

          <div className="field">
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input id="confirmPassword" type={showPassword ? "text" : "password"} name="confirmPassword"
              autoComplete="new-password" required
              value={formData.confirmPassword} onChange={handleChange} />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>

          <p className="auth-alt">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default Register;
