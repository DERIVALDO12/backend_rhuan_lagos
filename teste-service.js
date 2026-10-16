const service = require('./services/treinosService.js');

console.log(service.listarTodos());
console.log(service.criarTreino({ nome: 'Teste sem servidor', duracao: 15 }));
console.log(service.criarTreino({ nome: '', duracao: 15 }));