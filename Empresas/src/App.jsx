import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./Empresas.css";

const CARGOS = {
    1: "Diretor",
    2: "Gerente",
    3: "Analista"
}

function Empresas() {

    const [exibefuncionarios, setexibirfuncionarios] = useState(false)
    const [exibeempresas, setexibirempresas] = useState(true)
    const [empresas, setempresas] = useState([])
    const [funcionarios, setfuncionarios] = useState([])

    // funcionários da empresa clicada, exibidos abaixo da tabela de empresas
    const [funcionariosdaempresa, setfuncionariosdaempresa] = useState([])
    const [empresaselecionada, setempresaselecionada] = useState(null)

    // controle dos modais de cadastro
    const [modalempresa, setmodalempresa] = useState(false)
    const [modalfuncionario, setmodalfuncionario] = useState(false)

    // campos do formulário de empresa
    const [novaempresa, setnovaempresa] = useState({ nome: "", cnpj: "", endereco: "" })

    // campos do formulário de funcionário
    const [novofuncionario, setnovofuncionario] = useState({ nome: "", id_empresas: "", cargo: "", contato: "" })

    // status de conexão com a internet
    const [conectado, setconectado] = useState(navigator.onLine)

    async function busca_todas_empresas() {
        const {error, data} = await supabase.from("empresas").select()
        console.log(data);
        if (error) {
            console.log(error);
            alert("Erro ao buscar empresas: " + error.message)
            return
        }
        setempresas(data || [])
    }

    async function busca_funcionarios() {
        const {error, data} = await supabase.from("funcionarios").select("*, empresas(nome, endereco)") 
        /*.select("*, empresas")*/
        console.log(data);
        if (error) {
            console.log(error);
            alert("Erro ao buscar funcionários: " + error.message)
            return
        }
        setfuncionarios(data || [])
    }

    async function buscafuncionariosporempresa(empresa_id, nomeempresa){
        const {error, data} = await supabase
            .from("funcionarios")
            .select("*, empresas(nome, endereco)")
            .eq("id_empresas", empresa_id)

        if (error) {
            console.log(error);
            alert("Erro ao buscar funcionários da empresa: " + error.message)
            setfuncionariosdaempresa([])
            return
        }

        console.log(data);
        setfuncionariosdaempresa(data || [])
        setempresaselecionada(nomeempresa)
    }

    function alteravisualizacao(){
        setexibirempresas(!exibeempresas)
        setexibirfuncionarios(!exibefuncionarios)
    }

    function fecharmodalempresa(){
        setmodalempresa(false)
        setnovaempresa({ nome: "", cnpj: "", endereco: "" })
    }

    function fecharmodalfuncionario(){
        setmodalfuncionario(false)
        setnovofuncionario({ nome: "", id_empresas: "", cargo: "", contato: "" })
    }

    function abrirmodalempresa(){
        if (!conectado) {
            alert("Você está sem conexão com a internet. Não é possível cadastrar empresas agora.")
            return
        }
        setmodalempresa(true)
    }

    function abrirmodalfuncionario(){
        if (!conectado) {
            alert("Você está sem conexão com a internet. Não é possível cadastrar funcionários agora.")
            return
        }
        setmodalfuncionario(true)
    }

    async function cadastrarempresa(e){
        e.preventDefault()

        if (!conectado) {
            alert("Sem conexão com a internet. Verifique sua rede e tente novamente.")
            return
        }

        if (!novaempresa.nome || !novaempresa.cnpj) {
            alert("Preencha nome e CNPJ antes de salvar.")
            return
        }

        const {error, data} = await supabase.from("empresas").insert([novaempresa])
        if (error) {
            console.log(error);
            alert("Erro ao cadastrar empresa: " + error.message)
            return
        }
        fecharmodalempresa()
        busca_todas_empresas()
    }

    async function cadastrarfuncionario(e){
        e.preventDefault()

        if (!conectado) {
            alert("Sem conexão com a internet. Verifique sua rede e tente novamente.")
            return
        }

        if (!novofuncionario.nome || !novofuncionario.id_empresas || !novofuncionario.cargo) {
            alert("Preencha nome, empresa e cargo antes de salvar.")
            return
        }

        const payload = {
            nome: novofuncionario.nome,
            contato: novofuncionario.contato,
            cargo: Number(novofuncionario.cargo),
            id_empresas: Number(novofuncionario.id_empresas)
        }

        const {error, data} = await supabase.from("funcionarios").insert([payload])
        if (error) {
            console.log(error);
            alert("Erro ao cadastrar funcionário: " + error.message)
            return
        }
        fecharmodalfuncionario()
        busca_funcionarios()
    }

    useEffect(() =>{
        busca_todas_empresas()
        busca_funcionarios()
    }, [] )

    // monitora a conexão com a internet
    useEffect(() => {
        function aoficarconectado(){
            setconectado(true)
        }
        function aoficaroffline(){
            setconectado(false)
            alert("Você perdeu a conexão com a internet.")
        }

        window.addEventListener("online", aoficarconectado)
        window.addEventListener("offline", aoficaroffline)

        return () => {
            window.removeEventListener("online", aoficarconectado)
            window.removeEventListener("offline", aoficaroffline)
        }
    }, [])

    return (  
        <div className="container">
            <h1>Relaxionamento de Tabelas</h1>
            <p>Consulta na tabela de fnucionario</p>

            {
                !conectado ?
                <div className="aviso-offline">
                    Sem conexão com a internet. Algumas ações podem não funcionar.
                </div>
                :
                <></>
            }

            <div className="botoes-topo">
                <button onClick={abrirmodalfuncionario}>Cadastrar Funcionário</button>
                <button onClick={abrirmodalempresa}>Cadastrar Empresa</button>
                <button onClick={alteravisualizacao}>Alternar Empresas / Funcionários</button>
            </div>

            {
                modalempresa ?
                <div className="modal-overlay" onClick={fecharmodalempresa}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Cadastrar Empresa</h2>
                        <form onSubmit={cadastrarempresa}>
                            <div>
                                <label>Nome</label>
                                <input type="text" value={novaempresa.nome} onChange={e => setnovaempresa({...novaempresa, nome: e.target.value})} />
                            </div>
                            <div>
                                <label>CNPJ</label>
                                <input type="text" value={novaempresa.cnpj} onChange={e => setnovaempresa({...novaempresa, cnpj: e.target.value})} />
                            </div>
                            <div>
                                <label>Endereço</label>
                                <input type="text" value={novaempresa.endereco} onChange={e => setnovaempresa({...novaempresa, endereco: e.target.value})} />
                            </div>
                            <div className="modal-acoes">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={fecharmodalempresa}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
                :
                <></>
            }

            {
                modalfuncionario ?
                <div className="modal-overlay" onClick={fecharmodalfuncionario}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Cadastrar Funcionário</h2>
                        <form onSubmit={cadastrarfuncionario}>
                            <div>
                                <label>Nome</label>
                                <input type="text" value={novofuncionario.nome} onChange={e => setnovofuncionario({...novofuncionario, nome: e.target.value})} />
                            </div>
                            <div>
                                <label>Empresa</label>
                                <select value={novofuncionario.id_empresas} onChange={e => setnovofuncionario({...novofuncionario, id_empresas: e.target.value})}>
                                    <option value="">Selecione</option>
                                    {
                                        empresas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)
                                    }
                                </select>
                            </div>
                            <div>
                                <label>Cargo</label>
                                <select value={novofuncionario.cargo} onChange={e => setnovofuncionario({...novofuncionario, cargo: e.target.value})}>
                                    <option value="">Selecione</option>
                                    {
                                        Object.keys(CARGOS).map(id => <option key={id} value={id}>{CARGOS[id]}</option>)
                                    }
                                </select>
                            </div>
                            <div>
                                <label>Contato</label>
                                <input type="text" value={novofuncionario.contato} onChange={e => setnovofuncionario({...novofuncionario, contato: e.target.value})} />
                            </div>
                            <div className="modal-acoes">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={fecharmodalfuncionario}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
                :
                <></>
            }

             {
              exibeempresas == true ?
              <div>
              <h2>Empresas</h2>
              <table border="true" >
                <tr>
                <td>ID</td>
                <td>Nome</td>
                <td>CNPJ</td>
                <td>Endereço</td>
                <td>ações</td>
                </tr>
                {
                    empresas.map(i =>
                    <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.nome}</td>
                        <td>{i.cnpj}</td>
                        <td>{i.endereco}</td>
                        <td><button onClick={() => buscafuncionariosporempresa(i.id, i.nome)}>ver funcionarios</button></td>
                    </tr>)
                }
            </table>

            {
                empresaselecionada ?
                <div>
                    <h3>Funcionários de {empresaselecionada}</h3>
                    <table border="true">
                        <tr>
                        <td>ID</td>
                        <td>Nome</td>
                        <td>Cargo</td>
                        <td>Contato</td>
                        </tr>
                        {
                            funcionariosdaempresa.map(i =>
                            <tr key={i.id}>
                                <td>{i.id}</td>
                                <td>{i.nome}</td>
                                <td>{CARGOS[i.cargo]}</td>
                                <td>{i.contato}</td>
                            </tr>)
                        }
                    </table>
                </div>
                :
                <></>
            }
            </div>
              :
                <></>
            }
            
            {
              exibefuncionarios == true ?
                <div>
            <h2>Funcionarios</h2>

            <table border="true" >
                <tr>
                <td>ID</td>
                <td>Nome</td>
                <td>Nome da Empresa</td>
                <td>Endereço da Empresa</td>
                <td>Cargo</td>
                <td>Contato</td>
                </tr>
                {
                    funcionarios.map(i => 
                    <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.nome}</td>
                        <td>{i.empresas?.nome}</td>
                        <td>{i.empresas?.endereco}</td>
                        
                        <td>{CARGOS[i.cargo]}</td>
                        <td>{i.contato}</td>
                    </tr>
                    )
                }
            </table>
              </div>
              :
              <></>
            }
            
        </div>
    );
}

export default Empresas;