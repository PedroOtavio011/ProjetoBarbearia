
const campoDataCancela = document.getElementById('data-cancelar');
const listaParaCancelar = document.getElementById('lista-cancelar'); // Corrigido: document
const btnConfirmar = document.querySelector('.btn-cancelar');
let idSelecionado = null;
let dadosParaAviso = null

// 1. Função para BUSCAR os horários (Adicionado ASYNC aqui)
campoDataCancela.addEventListener('change', async () => {
    const data = campoDataCancela.value;
    if (!data) return;

    const { data: agendamentos, error } = await supabaseClient
        .from('agendamentos')
        .select('id, horario, nome_cliente, servico, telefone')
        .eq('data', data);

    listaParaCancelar.innerHTML = '';

    if (error) {
        console.error("Erro ao buscar:", error);
        return;
    }

    if (agendamentos.length === 0) {
        listaParaCancelar.innerHTML = '<p style="color: gray;">Não há agendamentos para esta data.</p>';
        return;
    }

    agendamentos.forEach(reserva => {
        const botao = document.createElement('button');
        botao.textContent = `Selecionar: ${reserva.nome_cliente} às ${reserva.horario}`;
        botao.type = "button"; // Evita que o botão dê submit no form sem querer
        botao.style.display = 'block';
        botao.style.margin = '10px 0';
        botao.style.padding = '10px';
        botao.style.width = '100%';
        botao.style.cursor = 'pointer';

        botao.onclick = () => {
            // Limpa o fundo de todos os botões da lista
            Array.from(listaParaCancelar.children).forEach(b => b.style.background = "");
            // Destaca o selecionado
            botao.style.background = '#ffcccc'; 
            idSelecionado = reserva.id;

            dadosParaAviso = {
                nome: reserva.nome_cliente,
                horario: reserva.horario,
                data: campoDataCancela.value,
                telefone: reserva.telefone,
                servico: reserva.servico
            }
        };
        listaParaCancelar.appendChild(botao);
    });
});

// 2. Função para DELETAR (Adicionado ASYNC aqui)
btnConfirmar.onclick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); // Evita que outros eventos interfiram

    if (!idSelecionado || !dadosParaAviso) {
        alert("Clique em um horário na lista primeiro para selecionar!");
        return;
    }

    console.log("Tentando excluir o ID:", idSelecionado); // Para você ver no console (F12)

    if(confirm(`Deseja cancelar e avisar ${dadosParaAviso.nome}?`)){
        
    try {

        const msg = `Olá ${dadosParaAviso.nome}, aqui é da Barbearia. Infelizmente precisamos cancelar seu horário de ${dadosParaAviso.servico} no dia ${dadosParaAviso.data} às ${dadosParaAviso.horario}.`;
        const link = `https://wa.me/55${dadosParaAviso.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(link, '_blank');



        const { error } = await supabaseClient
            .from('agendamentos')
            .delete()
            .eq('id', idSelecionado);

        if (error) {
            throw error;
        }

        alert("Agendamento removido com sucesso!");
        idSelecionado = null;
        dadosParaAviso
        
        // Recarrega a lista de cancelamento
        await campoDataCancela.dispatchEvent(new Event('change'));
        
        // Atualiza o select de horários do outro arquivo
        if (typeof atualizarInterface === "function") {
            atualizarInterface();
        }

    } catch (err) {
        console.error("Erro completo:", err);
        alert("Erro ao excluir no banco: " + err.message);
    }

}};