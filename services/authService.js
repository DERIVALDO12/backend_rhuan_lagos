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

