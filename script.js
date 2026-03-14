// Configuração do Supabase
const _supabaseUrl = 'https://yvezogfupryfbeejppvf.supabase.co';
const _supabaseKey = 'sb_publishable_xTJuaPPixxyf9cMuMNm8lw_0iXuzOkf';
const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);

const campoData = document.getElementById('data');
const selectHorario = document.getElementById('select-horario');
const formAgendamento = document.getElementById('form-agendamento');

// 1. FUNÇÃO PARA BUSCAR HORÁRIOS OCUPADOS
async function atualizarHorariosDisponiveis() {
    const dataSelecionada = campoData.value;
    if (!dataSelecionada) return;

    // 1. Busca no banco
    const { data: agendamentos, error } = await supabaseClient
        .from('agendamentos')
        .select('horario')
        .eq('data', dataSelecionada);

    if (error) {
        console.error('Erro na busca:', error);
        return;
    }

    // 2. Extrai os horários (se vier nulo, vira um array vazio)
    const ocupados = agendamentos ? agendamentos.map(a => a.horario) : [];
    
    console.log("Horários ocupados no banco:", ocupados);

    // 3. Atualiza o visual do Select
    Array.from(selectHorario.options).forEach(option => {
        if (option.value === "") return;

        // Verifica se o horário da opção está contido no que veio do banco
        const estaOcupado = ocupados.some(h => h.includes(option.value));

        if (estaOcupado) {
            option.disabled = true;
            option.style.color = "red";
            option.textContent = option.value + " (Ocupado)";
        } else {
            option.disabled = false;
            option.style.color = "black";
            option.textContent = option.value;
        }
    });
}

// Escuta quando a data muda
campoData.addEventListener('change', atualizarHorariosDisponiveis);

// 2. FUNÇÃO PARA SALVAR O AGENDAMENTO
formAgendamento.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome-cliente').value;
    const data = campoData.value;
    const horario = selectHorario.value;
    // CAPTURA O SERVIÇO SELECIONADO AQUI:
    const servico = document.getElementById('select-servico').value;

    if (!horario || !servico) {
        alert("Por favor, selecione o horário e o serviço!");
        return;
    }

    // Salva no Supabase usando a variável 'servico'
    const { error } = await supabaseClient
        .from('agendamentos')
        .insert([{ 
            nome_cliente: nome, 
            data: data, 
            horario: horario,
            servico: servico 
        }]);

    if (error) {
        alert("Erro ao agendar: " + error.message);
    } else {
        alert(`Sucesso! ${nome}, seu horário para ${servico} foi reservado.`);
        formAgendamento.reset(); 
        atualizarHorariosDisponiveis(); 
    }
});

    if (error) {
        alert("Erro ao agendar: " + error.message);
    } else {
        alert("Agendamento realizado com sucesso para " + nome + "!");
        formAgendamento.reset(); // Limpa o formulário
        atualizarHorariosDisponiveis(); // Atualiza a lista de horários
    }
atualizarHorariosDisponiveis();
