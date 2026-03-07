// Configuração do Supabase
const _supabaseUrl = 'https://yvezogfupryfbeejppvf.supabase.co';
const _supabaseKey = 'sb_publishable_xTJuaPPixxyf9cMuMNm8lw_0iXuzOkf';
const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);

const selectHorario = document.getElementById('select-horario');
const campoData = document.getElementById('data');
const formBloqueio = document.querySelector('.form'); 

// 1. FUNÇÃO PARA BUSCAR E MARCAR HORÁRIOS JÁ OCUPADOS
async function atualizarInterface() {
    const { data: agendamentos, error } = await supabaseClient
        .from('agendamentos')
        .select('horario')
        .eq('data', campoData.value);

    if (error) {
        console.error('Erro na busca:', error);
        return;
    }

    const bloqueados = agendamentos ? agendamentos.map(a => a.horario) : [];

    // Percorre as opções do select
    Array.from(selectHorario.options).forEach(horarioOption => {
        if (horarioOption.value === "") return;

        // Se o horário já estiver no banco, ele fica vermelho e desabilitado
        if (bloqueados.includes(horarioOption.value)) {
            horarioOption.disabled = true;
            horarioOption.style.color = "red";
            horarioOption.textContent = horarioOption.value + " (INDISPONÍVEL)";
        } else {
            horarioOption.disabled = false;
            horarioOption.style.color = "black";
            horarioOption.textContent = horarioOption.value;
        }
    });
}

// Escuta a mudança de data para atualizar a lista
campoData.addEventListener('change', atualizarInterface);

// 2. FUNÇÃO PARA BLOQUEAR (SALVAR NO BANCO)
formBloqueio.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede a página de recarregar

    const dataValue = campoData.value;
    const horarioValue = selectHorario.value;

    // Inserimos um registro "fake" no banco para ocupar o horário
    // Definimos o nome como "BLOQUEADO" ou "RESERVADO PELO BARBEIRO"
    const { error } = await supabaseClient
        .from('agendamentos')
        .insert([{ 
            nome_cliente: "BLOQUEADO (ADMIN)", 
            data: dataValue, 
            horario: horarioValue,
            servico: "BLOQUEIO" 
        }]);

    if (error) {
        alert("Erro ao bloquear: " + error.message);
    } else {
        alert("Horário bloqueado com sucesso!");
        atualizarInterface(); // Atualiza a lista para o horário sumir na hora
    }
});
// 1. Capturamos os novos elementos do HTML
const campoDataConsulta = document.getElementById('marcados');
const listaAgendados = document.getElementById('horarios-agendados');

// 2. Função que busca e EXIBE os agendamentos na tela
async function carregarAgendamentosDoDia() {
    const dataAlvo = campoDataConsulta.value;
    if (!dataAlvo) return;

    const { data: agendamentos, error } = await supabaseClient
        .from('agendamentos')
        .select('nome_cliente, horario, servico')
        .eq('data', dataAlvo)
        .order('horario', { ascending: true });

    if (error) {
        console.error('Erro ao carregar lista:', error);
        return;
    }

    
   
    // Isso garante que a tela comece "do zero" a cada busca
    const elementosParaLimpar = listaAgendados.querySelectorAll('.card-agendamento, .msg-vazia');
    elementosParaLimpar.forEach(el => el.remove());

    // 1. Caso NÃO tenha ninguém marcado:
    if (agendamentos.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'msg-vazia'; // Classe para podermos remover depois
        msg.style.color = "gray";
        msg.style.marginTop = "15px";
        msg.style.textAlign = "center";
        msg.textContent = "Nenhum agendamento para este dia.";
        listaAgendados.appendChild(msg);
        return; // Para a execução aqui
    }

    // 2. Caso TENHA horários marcados:
    // O código só chega aqui se o 'if' de cima for falso
    agendamentos.forEach(reserva => {
        const item = document.createElement('div');
        item.className = 'card-agendamento'; 
        
        item.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 12px; margin-top: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background-color: #f9f9f9; color: #333; box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
                <span>
                    <strong style="color: #222;">${reserva.horario}</strong> — ${reserva.nome_cliente}
                </span>
                <span style="font-size: 0.85em; background: #eee; padding: 4px 8px; border-radius: 4px; color: #555;">
                    ${reserva.servico}
                </span>
            </div>
        `;
        listaAgendados.appendChild(item);
    });
}

campoDataConsulta.addEventListener('change', carregarAgendamentosDoDia);