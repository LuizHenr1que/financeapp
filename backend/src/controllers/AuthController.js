const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');

class AuthController {
  // Registro de usuário
  async register(req, res) {
    try {
      console.log('🔍 Register attempt - Request body:', req.body);
      
      // Verificar erros de validação
      const errors = validationResult(req);
      console.log('🔍 Validation errors:', errors.array());
      
      if (!errors.isEmpty()) {
        console.log('❌ Validation failed:', errors.array());
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { name, email, password, phone } = req.body;

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email já está em uso'
        });
      }

      // Criptografar a senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Criar o usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true
        }
      });

      // Gerar token JWT
      const token = generateToken(user.id);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user,
        token
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Login de usuário
  async login(req, res) {
    try {
      console.log('🔍 Login attempt - Request body:', req.body);
      
      // Verificar erros de validação
      const errors = validationResult(req);
      console.log('🔍 Validation errors:', errors.array());
      
      if (!errors.isEmpty()) {
        console.log('❌ Validation failed:', errors.array());
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;
      console.log('🔐 Tentativa de login:', { email, passwordLength: password?.length });

      // Buscar usuário pelo email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('❌ Usuário não encontrado:', email);
        return res.status(401).json({
          error: 'Email ou senha incorretos'
        });
      }

      console.log('✅ Usuário encontrado:', { id: user.id, email: user.email });

      // Verificar a senha
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log('❌ Senha incorreta para:', email);
        return res.status(401).json({
          error: 'Email ou senha incorretos'
        });
      }

      console.log('✅ Login bem-sucedido para:', email);

      // Gerar token JWT
      const token = generateToken(user.id);

      // Remover senha do retorno
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Verificar token
  async me(req, res) {
    try {
      // O usuário já está disponível no req.user através do middleware de auth
      res.json({
        user: req.user
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { name, phone, avatar } = req.body;
      const userId = req.user.id;

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(avatar !== undefined && { avatar })
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Alterar senha
  async changePassword(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Buscar usuário com senha
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Senha atual incorreta'
        });
      }

      // Criptografar nova senha
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Atualizar senha
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      res.json({
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new AuthController();
