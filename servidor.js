// ============================================================
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================
// Este arquivo esta quase vazio DE PROPOSITO.
// Hoje voce vai escrever as rotas, uma de cada vez, conferindo
// no testes.http se cada uma responde o status certo.
// O que cada rota deve fazer esta no README.md.
// ============================================================

const express = require('express');
const app = express();
const { DatabaseSync } = require('node:sqlite');
// Conecta ao banco (cria o arquivo treinos.db se nao existir)
const db = new DatabaseSync('treinos.db');
// Faz o Express entender JSON no corpo das requisicoes
app.use(express.json());
// Garante que a tabela existe
db.exec(`
CREATE TABLE IF NOT EXISTS treinos (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
duracao INTEGER NOT NULL
)
`);
// ------------------------------------------------------------
// Os dados moram aqui, na memoria. Somem quando o servidor cai.
// (Na Aula 03 isso vira banco de dados.)
// ------------------------------------------------------------


// ------------------------------------------------------------
// Validacao
// Escreva a funcao validarTreino(corpo), que devolve a mensagem
// de erro quando algo esta errado, ou null quando esta tudo certo.
// ------------------------------------------------------------

function validarTreino(corpo) {
    if (typeof corpo.nome !== 'string' || corpo.nome.trim() === '') {
        return 'O campo nome e obrigatorio e deve ser um texto.';
    }
    if (typeof corpo.duracao !== 'number' || corpo.duracao <= 0) {
        return 'O campo duracao e obrigatorio e deve ser um numero maior que zero.';
    }
    return null;
}
// ------------------------------------------------------------
// GET /treinos - lista todos os treinos
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
  const { busca } = req.query;

  // Se o usuario informou um parametro de busca, filtra os resultados
  if (busca) {
    const treinosFiltrados = db
      .prepare('SELECT * FROM treinos WHERE nome LIKE ? COLLATE NOCASE')
      .all(`%${busca}%`);
    
    return res.status(200).json(treinosFiltrados);
  }

  // Se nao informou busca, lista todos normalmente
  const treinos = db.prepare('SELECT * FROM treinos').all();
  res.status(200).json(treinos);
});

// ------------------------------------------------------------
// GET /treinos/resumo - Estatisticas dos treinos (DEVE VIR ANTES DO :id)
// ------------------------------------------------------------
app.get('/treinos/resumo', (req, res) => {
  // Executa COUNT, SUM e AVG em uma única consulta
  // IFNULL garante que retorne 0 em vez de null caso o banco esteja vazio
  const resumo = db
    .prepare(`
      SELECT 
        COUNT(*) as total, 
        IFNULL(SUM(duracao), 0) as minutos, 
        IFNULL(AVG(duracao), 0) as media 
      FROM treinos
    `)
    .get();

  res.status(200).json(resumo);
});
// ------------------------------------------------------------
// GET /treinos/:id - busca um treino pelo id (404 se nao existir)
// ------------------------------------------------------------
app.get('/treinos/:id', (req, res) => {
  const idInformado = req.params.id;
  const id = Number(idInformado);

  // Valida se o ID é de fato um número inteiro válido (e rejeita coisas como "abc" ou "1.5")
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O ID do treino deve ser um número inteiro válido.' });
  }

  const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
  
  if (treino === undefined) {
    return res.status(404).json({ erro: 'Treino nao encontrado.' });
  }

  res.status(200).json(treino);
});
// ------------------------------------------------------------
// POST /treinos - cria um treino (400 se os dados forem invalidos)
// ------------------------------------------------------------
app.post('/treinos', (req, res) => {
const erro = validarTreino(req.body);
if (erro !== null){
return res.status(400).json({ erro: erro });
}

const resultado = db
.prepare('INSERT INTO treinos (nome, duracao) VALUES (?, ?)')
.run(req.body.nome, req.body.duracao);

const novo = db
.prepare('SELECT * FROM treinos WHERE id = ?')
.get(resultado.lastInsertRowid);
res.status(201).json(novo);
});
// ------------------------------------------------------------
// PUT /treinos/:id - substitui um treino
// ------------------------------------------------------------
app.put('/treinos/:id', (req, res) => {
const id = Number(req.params.id);
const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
if (treino === undefined) {
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
const erro = validarTreino(req.body);
if (erro !== null){
return res.status(400).json({ erro: erro });
}
db.prepare('UPDATE treinos SET nome = ?, duracao = ? WHERE id = ?')
.run(req.body.nome, req.body.duracao, id);
const atualizado = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
res.status(200).json(atualizado);
});
// ------------------------------------------------------------
// DELETE /treinos/:id - remove um treino
// ------------------------------------------------------------
app.delete('/treinos/:id', (req, res) => {
const id = Number(req.params.id);
const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
if (treino === undefined) {
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
db.prepare('DELETE FROM treinos WHERE id = ?').run(id);
res.status(204).end();
});
// ------------------------------------------------------------
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});


