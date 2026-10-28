const User = require("../models/User");
const { hashPassword, verifyPassword, isHashed } = require("../utils/password");

/*
REGISTRAR USUÁRIO POST /api/auth/register 
*/
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Preencha nome, email e senha"
      });
    }

    // verifica se já existe usuário com esse email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email já cadastrado"
      });
    }

    // cria novo usuário
    const newUser = await User.create({
      name,
      email,
      password: hashPassword(password)
    });

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      user: newUser
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao cadastrar usuário",
      error: error.message
    });
  }
};

/*

LOGIN DE USUÁRIO  POST /api/auth/login ATENTAR !1

*/
const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // procura usuário pelo email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    // verifica senha
    if (!verifyPassword(password, user.password)) {
      return res.status(400).json({
        message: "Senha incorreta"
      });
    }

    if (!isHashed(user.password)) {
      user.password = hashPassword(password);
      await user.save();
    }

    res.json({
      message: "Login realizado com sucesso",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao realizar login",
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar perfil",
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        message: "Nome e email são obrigatórios"
      });
    }

    const existingUser = await User.findOne({ email, _id: { $ne: id } });

    if (existingUser) {
      return res.status(400).json({
        message: "Email já cadastrado"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone: phone || ""
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    res.json({
      message: "Perfil atualizado com sucesso",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar perfil",
      error: error.message
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Preencha a senha atual e a nova senha"
      });
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(400).json({
        message: "Senha atual incorreta"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "A nova senha deve ter no mínimo 6 caracteres"
      });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        message: "A nova senha deve conter pelo menos 1 número"
      });
    }

    user.password = hashPassword(newPassword);

    await user.save();

    res.json({
      message: "Senha atualizada com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar senha",
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword
};
