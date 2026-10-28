import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserProfile, updateUserPassword, updateUserProfile } from "../services/authService";
import { getUser, alertTheme } from "../lib";
import { Words } from "../components/ui";
import "./Profile.css";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  useEffect(() => {
    if (!user?._id) return;

    getUserProfile(user._id)
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => {
        // mantém os dados locais se o backend estiver fora do ar
      });
  }, [user?._id]);

  if (!user) return null;

  const openProfileEditor = async (focusField = "name") => {
    const { value: formValues } = await Swal.fire(alertTheme({
      title: "Editar perfil",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Salvar",
      reverseButtons: true,
      focusConfirm: false,
      didOpen: () => {
        const field = document.getElementById(`swal-${focusField}`);
        field?.focus();
        field?.select?.();
      },
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Nome" aria-label="Nome" value="${esc(user.name)}">
        <input id="swal-email" class="swal2-input" placeholder="Email" aria-label="Email" value="${esc(user.email)}">
        <input id="swal-phone" class="swal2-input" placeholder="Telefone" aria-label="Telefone" value="${esc(user.phone)}">
      `,
      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        const email = document.getElementById("swal-email").value.trim();
        const phone = document.getElementById("swal-phone").value.trim();

        if (!name || !email) {
          Swal.showValidationMessage("Preencha nome e email");
          return false;
        }

        return { name, email, phone };
      }
    }));

    if (!formValues) return;

    try {
      const data = await updateUserProfile(user._id, formValues);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      Swal.fire(alertTheme({ icon: "success", title: "Perfil atualizado", timer: 1500, showConfirmButton: false }));
    } catch (error) {
      Swal.fire(alertTheme({ icon: "error", title: "Não foi possível atualizar", text: error.message }));
    }
  };

  const handlePasswordUpdate = async () => {
    const { value: formValues } = await Swal.fire(alertTheme({
      title: "Alterar senha",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Alterar",
      reverseButtons: true,
      focusConfirm: false,
      html: `
        <input id="swal-current-password" type="password" class="swal2-input" placeholder="Senha atual" aria-label="Senha atual" autocomplete="current-password">
        <input id="swal-new-password" type="password" class="swal2-input" placeholder="Nova senha" aria-label="Nova senha" autocomplete="new-password">
        <input id="swal-confirm-password" type="password" class="swal2-input" placeholder="Confirmar nova senha" aria-label="Confirmar nova senha" autocomplete="new-password">
      `,
      preConfirm: () => {
        const currentPassword = document.getElementById("swal-current-password").value;
        const newPassword = document.getElementById("swal-new-password").value;
        const confirmPassword = document.getElementById("swal-confirm-password").value;

        if (!currentPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage("Preencha todos os campos");
          return false;
        }
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage("As novas senhas precisam ser iguais");
          return false;
        }

        return { currentPassword, newPassword };
      }
    }));

    if (!formValues) return;

    try {
      await updateUserPassword(user._id, formValues);
      Swal.fire(alertTheme({ icon: "success", title: "Senha alterada", timer: 1500, showConfirmButton: false }));
    } catch (error) {
      Swal.fire(alertTheme({ icon: "error", title: "Não foi possível alterar", text: error.message }));
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire(alertTheme({
      title: "Sair da conta?",
      showCancelButton: true,
      confirmButtonText: "Sair",
      cancelButtonText: "Cancelar"
    }));

    if (!result.isConfirmed) return;

    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      <Navbar />

      <main>
        <header className="page-title">
          <Words text={user.name || "Perfil"} />
          <p>{user.email}</p>
        </header>

        <div className="page-body profile-grid">
          <section className="panel" aria-labelledby="dados-h">
            <h2 id="dados-h">Seus dados</h2>
            <dl>
              <div><dt>Nome</dt><dd>{user.name}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Telefone</dt><dd>{user.phone || "Não informado"}</dd></div>
            </dl>
            <button type="button" className="btn" onClick={() => openProfileEditor("name")}>Editar dados</button>
          </section>

          <section className="panel panel-accent" aria-labelledby="conta-h">
            <h2 id="conta-h">Conta</h2>
            <div className="profile-actions">
              <button type="button" className="btn btn-quiet" onClick={handlePasswordUpdate}>Alterar senha</button>
              <button type="button" className="btn btn-quiet" onClick={handleLogout}>Sair da conta</button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Profile;
