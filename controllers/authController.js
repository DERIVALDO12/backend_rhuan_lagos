function lerCookie(req, nome) {
const cabecalho = req.headers.cookie; // "sid=9f2c; tema=escuro" ou undefined
if (!cabecalho) return null;
const pares = cabecalho.split(';'); // ["sid=9f2c", " tema=escuro"]
for (const par of pares) {
const [chave, valor] = par.trim().split('=');
if (chave === nome) return valor;
}
return null;
}
function usuarioDaRequisicao(req) {
const token = lerCookie(req, 'sid');
if (token === null) return null; // nao mandou cookie
const id = sessoes.usuarioIdDaSessao(token);
if (id === undefined) return null; // cookie vencido ou invalido
return usuariosRepository.buscarPorId(id); // { id, usuario }
}
function perfil(req, res) {
const dono = usuarioDaRequisicao(req);
if (dono === null){
return res.status(401).json({ erro: 'Faca login primeiro.' });
}
res.status(200).json(dono); // a rota agora SABE quem e
}
function logout(req, res) {
const token = lerCookie(req, 'sid');
if (token !== null) sessoes.encerrar(token);
res.clearCookie('sid');
res.status(204).end();
}
module.exports = { login, perfil, logout };