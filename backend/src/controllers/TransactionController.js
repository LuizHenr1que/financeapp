const { validationResult } = require('express-validator');
const prisma = require('../config/database');

class TransactionController {
  // Criar transação
  async create(req, res) {
    try {
      console.log('\n🚀 === DADOS RECEBIDOS DA REQUISIÇÃO ===');
      console.log('📦 Body da requisição:', JSON.stringify(req.body, null, 2));
      console.log('👤 Usuário:', req.user?.id || 'N/A');
      console.log('🚀 === FIM DOS DADOS DA REQUISIÇÃO ===\n');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ ERROS DE VALIDAÇÃO ENCONTRADOS:');
        errors.array().forEach(error => {
          console.log(`  - Campo: ${error.path || error.param}`);
          console.log(`    Valor: ${error.value}`);
          console.log(`    Erro: ${error.msg}`);
        });
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const {
        type,
        amount,
        description,
        title,
        date,
        categoryId,
        accountId,
        cardId,
        paymentMethod,
        launchType = 'unico',
        installments,
        valorComoParcela = false,
        recurrenceType
      } = req.body;

      // Verificar se a categoria pertence ao usuário
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: userId
        }
      });

      if (!category) {
        return res.status(404).json({
          error: 'Categoria não encontrada'
        });
      }

      // Verificar se é uma transação com cartão ou conta
      let finalAccountId = null;
      let finalCardId = null;

      if (cardId) {
        // Verificar se o cartão pertence ao usuário
        console.log('🔍 Verificando cartão com ID:', cardId);
        const card = await prisma.card.findFirst({
          where: {
            id: cardId,
            userId: userId
          }
        });

        console.log('💳 Cartão encontrado:', card);
        if (!card) {
          return res.status(404).json({
            error: 'Cartão não encontrado'
          });
        }
        
        // Para transações de cartão, precisamos de uma conta também
        // Se accountId foi fornecido, usar ele; senão, usar a primeira conta ativa
        console.log('🔍 AccountId fornecido:', accountId);
        if (accountId) {
          const account = await prisma.account.findFirst({
            where: {
              id: accountId,
              userId: userId,
              isActive: true
            }
          });

          console.log('🏦 Conta buscada com accountId fornecido:', account);
          if (!account) {
            console.log('❌ Conta não encontrada com o ID fornecido. Buscando primeira conta ativa...');
            // Se a conta fornecida não existe, usar a primeira conta ativa
            const defaultAccount = await prisma.account.findFirst({
              where: {
                userId: userId,
                isActive: true
              },
              orderBy: {
                createdAt: 'asc'
              }
            });

            if (!defaultAccount) {
              return res.status(404).json({
                error: 'Nenhuma conta ativa encontrada para associar à transação do cartão'
              });
            }
            
            finalAccountId = defaultAccount.id;
            console.log('✅ Usando conta padrão:', defaultAccount);
          } else {
            finalAccountId = accountId;
            console.log('✅ Usando conta fornecida:', account);
          }
        } else {
          // Buscar a primeira conta ativa do usuário
          const defaultAccount = await prisma.account.findFirst({
            where: {
              userId: userId,
              isActive: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          });

          if (!defaultAccount) {
            return res.status(404).json({
              error: 'Nenhuma conta ativa encontrada para associar à transação do cartão'
            });
          }
          
          finalAccountId = defaultAccount.id;
        }
        
        finalCardId = cardId;
      } else if (accountId) {
        // Verificar se a conta pertence ao usuário
        const account = await prisma.account.findFirst({
          where: {
            id: accountId,
            userId: userId,
            isActive: true
          }
        });

        if (!account) {
          return res.status(404).json({
            error: 'Conta não encontrada ou inativa'
          });
        }
        
        finalAccountId = accountId;
        finalCardId = null;
      } else {
        return res.status(400).json({
          error: 'É necessário informar uma conta ou cartão para a transação'
        });
      }

      // Processar diferentes tipos de lançamento
      let createdTransactions = [];

      if (launchType === 'unico') {
        // Transação única
        const transaction = await prisma.transaction.create({
          data: {
            type,
            amount,
            description,
            title,
            date: new Date(date),
            categoryId,
            accountId: finalAccountId,
            userId,
            cardId: finalCardId,
            paymentMethod: paymentMethod || null,
            launchType
          },
          include: {
            category: true,
            account: true,
            card: true
          }
        });

        console.log('✅ TRANSAÇÃO ÚNICA CRIADA:', {
          id: transaction.id,
          tipo: transaction.type,
          valor: transaction.amount,
          descricao: transaction.description,
          data: transaction.date
        });

        createdTransactions.push(transaction);

      } else if (launchType === 'recorrente') {
        // Transações recorrentes
        const numInstallments = installments || 12;
        const baseDate = new Date(date);

        // Criar transação pai
        const parentTransaction = await prisma.transaction.create({
          data: {
            type,
            amount,
            description,
            title,
            date: baseDate,
            categoryId,
            accountId: finalAccountId,
            userId,
            cardId: finalCardId,
            paymentMethod: paymentMethod || null,
            launchType,
            installments: numInstallments,
            recurrenceType,
            currentInstallment: 1
          }
        });

        createdTransactions.push(parentTransaction);

        // Criar transações filhas para as próximas recorrências
        for (let i = 1; i < numInstallments; i++) {
          const futureDate = new Date(baseDate);
          
          if (recurrenceType === 'Mensal') {
            futureDate.setMonth(futureDate.getMonth() + i);
          } else if (recurrenceType === 'Semanal') {
            futureDate.setDate(futureDate.getDate() + (i * 7));
          } else if (recurrenceType === 'Anual') {
            futureDate.setFullYear(futureDate.getFullYear() + i);
          }

          const childTransaction = await prisma.transaction.create({
            data: {
              type,
              amount,
              description,
              title,
              date: futureDate,
              categoryId,
              accountId: finalAccountId,
              userId,
              cardId: finalCardId,
              paymentMethod: paymentMethod || null,
              launchType,
              installments: numInstallments,
              recurrenceType,
              currentInstallment: i + 1,
              parentTransactionId: parentTransaction.id
            }
          });

          createdTransactions.push(childTransaction);
        }

      } else if (launchType === 'parcelado') {
        // Transações parceladas
        const numInstallments = installments || 1;
        const baseDate = new Date(date);
        
        // Calcular valor da parcela
        const installmentAmount = valorComoParcela ? amount : amount / numInstallments;

        // Criar transação pai
        const parentTransaction = await prisma.transaction.create({
          data: {
            type,
            amount: valorComoParcela ? amount * numInstallments : amount,
            description,
            title,
            date: baseDate,
            categoryId,
            accountId: finalAccountId,
            userId,
            cardId: finalCardId,
            paymentMethod: paymentMethod || null,
            launchType,
            installments: numInstallments,
            valorComoParcela,
            currentInstallment: 1
          }
        });

        createdTransactions.push(parentTransaction);

        // Criar parcelas futuras
        for (let i = 1; i < numInstallments; i++) {
          const futureDate = new Date(baseDate);
          futureDate.setMonth(futureDate.getMonth() + i);

          const childTransaction = await prisma.transaction.create({
            data: {
              type,
              amount: installmentAmount,
              description,
              title,
              date: futureDate,
              categoryId,
              accountId: finalAccountId,
              userId,
              cardId: finalCardId,
              paymentMethod: paymentMethod || null,
              launchType,
              installments: numInstallments,
              valorComoParcela,
              currentInstallment: i + 1,
              parentTransactionId: parentTransaction.id
            }
          });

          createdTransactions.push(childTransaction);
        }
      }

      // Retornar as transações criadas
      const transactionsWithDetails = await prisma.transaction.findMany({
        where: {
          id: {
            in: createdTransactions.map(t => t.id)
          }
        },
        include: {
          category: true,
          account: true,
          card: true,
          parentTransaction: true,
          childTransactions: true
        },
        orderBy: {
          date: 'asc'
        }
      });

      console.log('\n🎯 === TRANSAÇÕES CRIADAS E SALVAS NA TABELA ===');
      console.log(`📊 Total de transações criadas: ${transactionsWithDetails.length}`);
      console.log('📋 Detalhes das transações:');
      
      transactionsWithDetails.forEach((transaction, index) => {
        console.log(`\n--- Transação ${index + 1} ---`);
        console.log(`ID: ${transaction.id}`);
        console.log(`Tipo: ${transaction.type}`);
        console.log(`Valor: R$ ${transaction.amount}`);
        console.log(`Título: ${transaction.title || 'N/A'}`);
        console.log(`Descrição: ${transaction.description}`);
        console.log(`Data: ${transaction.date}`);
        console.log(`Categoria: ${transaction.category?.name || 'N/A'}`);
        console.log(`Cartão/Conta: ${transaction.card?.name || transaction.account?.name || 'N/A'}`);
        console.log(`Tipo de lançamento: ${transaction.launchType}`);
        console.log(`Parcela atual: ${transaction.currentInstallment || 'N/A'}`);
        console.log(`Total de parcelas: ${transaction.installments || 'N/A'}`);
        console.log(`Valor como parcela: ${transaction.valorComoParcela}`);
        console.log(`Tipo de recorrência: ${transaction.recurrenceType || 'N/A'}`);
        console.log(`Transação pai: ${transaction.parentTransactionId || 'É transação pai'}`);
      });
      console.log('\n🎯 === FIM DOS DADOS DA TABELA ===\n');

      res.status(201).json({
        message: 'Transação(ões) criada(s) com sucesso',
        transactions: transactionsWithDetails,
        count: transactionsWithDetails.length
      });

    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar transações do usuário
  async index(req, res) {
    try {
      console.log('\n📋 === LISTANDO TRANSAÇÕES ===');
      console.log('👤 Usuário logado:', req.user?.id || 'NENHUM USUÁRIO');
      console.log('👤 Nome do usuário:', req.user?.name || 'N/A');
      console.log('👤 Email do usuário:', req.user?.email || 'N/A');
      
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 50, 
        type, 
        categoryId, 
        accountId,
        cardId,
        launchType,
        startDate,
        endDate 
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {
        userId: userId,
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(accountId && { accountId }),
        ...(cardId && { cardId }),
        ...(launchType && { launchType }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      };

      console.log('🔍 Filtros aplicados:', JSON.stringify(where, null, 2));

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            category: true,
            account: true,
            card: true,
            parentTransaction: {
              select: {
                id: true,
                title: true,
                installments: true
              }
            },
            childTransactions: {
              select: {
                id: true,
                date: true,
                currentInstallment: true
              },
              orderBy: {
                currentInstallment: 'asc'
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          skip: offset,
          take: parseInt(limit)
        }),
        prisma.transaction.count({ where })
      ]);

      console.log(`📊 Transações encontradas para o usuário ${userId}:`, transactions.length);
      console.log(`📊 Total de transações no banco para este usuário:`, total);
      
      if (transactions.length > 0) {
        console.log('📄 Primeiras transações:');
        transactions.slice(0, 3).forEach((t, i) => {
          console.log(`  ${i + 1}. ${t.description} - R$ ${t.amount} (${t.date})`);
        });
      } else {
        console.log('❌ Nenhuma transação encontrada para este usuário');
      }
      console.log('📋 === FIM DA LISTAGEM ===\n');

      res.json({
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Erro ao listar transações:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter transação por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId
        },
        include: {
          category: true,
          account: true,
          card: true,
          parentTransaction: {
            include: {
              childTransactions: {
                select: {
                  id: true,
                  date: true,
                  amount: true,
                  currentInstallment: true
                },
                orderBy: {
                  currentInstallment: 'asc'
                }
              }
            }
          },
          childTransactions: {
            select: {
              id: true,
              date: true,
              amount: true,
              currentInstallment: true
            },
            orderBy: {
              currentInstallment: 'asc'
            }
          }
        }
      });

      if (!transaction) {
        return res.status(404).json({
          error: 'Transação não encontrada'
        });
      }

      res.json({ transaction });

    } catch (error) {
      console.error('Erro ao obter transação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar transação
  async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Verificar se a transação existe e pertence ao usuário
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingTransaction) {
        return res.status(404).json({
          error: 'Transação não encontrada'
        });
      }

      // Se for uma transação parcelada/recorrente, perguntar se quer atualizar todas
      if (existingTransaction.launchType !== 'unico' && updates.updateAll) {
        const parentId = existingTransaction.parentTransactionId || existingTransaction.id;
        
        await prisma.transaction.updateMany({
          where: {
            OR: [
              { id: parentId },
              { parentTransactionId: parentId }
            ]
          },
          data: {
            ...updates,
            updateAll: undefined // remover flag do update
          }
        });

        const updatedTransactions = await prisma.transaction.findMany({
          where: {
            OR: [
              { id: parentId },
              { parentTransactionId: parentId }
            ]
          },
          include: {
            category: true,
            account: true,
            card: true
          }
        });

        return res.json({
          message: 'Todas as transações da série foram atualizadas',
          transactions: updatedTransactions
        });
      } else {
        // Atualizar apenas esta transação
        const transaction = await prisma.transaction.update({
          where: { id },
          data: updates,
          include: {
            category: true,
            account: true,
            card: true
          }
        });

        res.json({
          message: 'Transação atualizada com sucesso',
          transaction
        });
      }

    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Deletar transação
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { deleteAll = false } = req.query;

      // Verificar se a transação existe e pertence ao usuário
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingTransaction) {
        return res.status(404).json({
          error: 'Transação não encontrada'
        });
      }

      if (deleteAll && existingTransaction.launchType !== 'unico') {
        // Deletar toda a série
        const parentId = existingTransaction.parentTransactionId || existingTransaction.id;
        
        await prisma.transaction.deleteMany({
          where: {
            OR: [
              { id: parentId },
              { parentTransactionId: parentId }
            ]
          }
        });

        res.json({
          message: 'Todas as transações da série foram deletadas'
        });
      } else {
        // Deletar apenas esta transação
        await prisma.transaction.delete({
          where: { id }
        });

        res.json({
          message: 'Transação deletada com sucesso'
        });
      }

    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new TransactionController();
