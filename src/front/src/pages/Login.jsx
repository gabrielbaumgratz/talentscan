import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { loginUser } from "../services/authService";
import { alertTheme } from "../lib";
import Swal from "sweetalert2";
import { Words } from "../components/ui";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const data = await loginUser(formData);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      Swal.fire(alertTheme({ icon: "error", title: "Não deu pra entrar", text: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="auth">
        <div className="auth-title">
          <Words text="Entrar" />
          <p>Volte para o seu histórico de análises.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" autoComplete="email" required
              value={formData.email} onChange={handleChange} />
          </div>

          <div className="field pw">
            <label htmlFor="password">Senha</label>
            <input id="password" type={showPassword ? "text" : "password"} name="password"
              autoComplete="current-password" required
              value={formData.password} onChange={handleChange} />
            <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="auth-alt">
            Ainda não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default Login;
