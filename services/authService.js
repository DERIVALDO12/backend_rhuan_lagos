const repository = require('../repositories/usuariosRepository.js');
function login(usuario, senha) {
const encontrado = repository.buscarPorUsuario(usuario);
if (encontrado === undefined) {
return { invalido: true }; // usuario nao existe
}
if (encontrado.senha !== senha) {
return { invalido: true }; // senha errada (texto puro, por enquanto)
}
// devolve sem a senha
return { usuario: { id: encontrado.id, usuario: encontrado.usuario } };
}
module.exports = { login };

const service = require('../services/authService.js');
const sessoes = require('../sessoes.js');
const usuariosRepository = require('../repositories/usuariosRepository.js');
function login(req, res) {
const usuario = (req.body.usuario ?? '').trim();
const senha = req.body.senha ?? '';
const resultado = service.login(usuario, senha);
if (resultado.invalido === true){
// 401: "nao sei quem voce e". De proposito nao dizemos se foi o
// usuario ou a senha que errou, para nao ajudar quem tenta adivinhar.
return res.status(401).json({ erro: 'Usuario ou senha invalidos.' });
}
const token = sessoes.criar(resultado.usuario.id);
res.cookie('sid', token, { httpOnly: true });
res.status(200).json(resultado.usuario);
}